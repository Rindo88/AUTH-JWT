import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
const app = express();
const prisma = new PrismaClient()
dotenv.config();
app.use(cors());
app.use(express.json());

const authentication = (req, res, next) => {
  const token = req.headers['authorization']?.split(':')[1];
  if(!token){
    return res.status(401).send({message: 'require credential'});
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if(error){
     return res.status(403).send({message: 'invalid credential'});
    }
    res.user = user;
    next();
  });
}

app.post('/register', async (req,res) => {
  const { username, password, email } = req.body;
  const existUsername = await prisma.user.findUnique({ where: { username } });
  if(existUsername) return res.status(400).send({ message: 'Username already exists' });
  const existEmail = await prisma.user.findUnique({ where: { email } });
  if(existEmail) return res.status(400).send({ message: 'Email already exists' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const addUser = await prisma.user.create({
      data: { username, password: hashedPassword, email }
    });
    res.status(201).send({ message: 'registered successfully', username });
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'internal server error'});
  }
});

app.post('/login', async (req,res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });
    if(!existUser) return res.status(400).send({message: 'username not found'});

    const isMatch = await bcrypt.compare(password, existUser.password);
    if(!isMatch) return res.status(400).send({message: 'invalid password'});

    const token = jwt.sign({username: existUser.username}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({token})
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'internal server error'});
  }
});


app.get('/protected', authentication, async (req,res) => {
  res.status(200).send({message: 'success'})
})


app.use('/', (req,res) =>{
  res.status(404).json({message: "Page Not Found"})
});
app.listen(process.env.PORT, ()=>{
  console.log('Server running on port 3000');
});
