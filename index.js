const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 3000
const db = require('./config/db')
const DataFilm = require('./models/DataFilm')
const User = require('./models/User')
const fs = require('fs')
const path = require('path')


db.connect();

app.use(morgan('combined'));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')))

app.get('/DataFilms', (req, res) => {
    DataFilm.find({})
        .then( films => res.json(films) ) 

})
app.get('/Users', (req, res) => {
  User.find({})
      .then( users => res.json(users) ) 

})

//USER
app.post('/createUser', (req, res) => {
    console.log('Req data creat: ',req.body);
    
    const dataUser = req.body
    User.find({email: dataUser.email})
        .then( user => {
            if(user[0]) {
                res.json(true)
                console.log('Check exist:', true)
            
            } 
            else {
                res.json(false)
                console.log('Check exist:', false ,'=> Create User')
                const user = new User(req.body);
                user.save()
            }
        }) 
})

app.post('/login', (req, res) => {
    const dataRes = {}

    console.log('Req data login: ',req.body);

    const dataReq = req.body

    User.find({email: dataReq.email})
        .then( dataUser => {
            if (dataUser[0]) {

                dataRes.checkEmail =true;
                console.log('Check email:', true)

                if(dataReq.password === dataUser[0].password){

                    dataRes.checkPassword = true;
                    dataRes.idUser = dataUser[0]._id;
                    console.log('Check password:', true, '=> Login')
                    res.json(dataRes)
                }
                else{
                    dataRes.checkPassword = false;
                    res.json(dataRes)
                    console.log('Check password:', false)
                }
            } 
            else {
                dataRes.checkEmail = false;
                res.json(dataRes)
                console.log('Check email:', false)
            }
        })
})

//playlist
app.post('/addList', (req, res) => {
  const dataRes = {}
  console.log('Req data add list: ',req.body);
  const idUser = req.body.idUser
  const idFilm = req.body.idFilm

  User.find({ _id: idUser })
      .then ((user) => {
        const dataList = user[0].playlist;
        const checkList = dataList.find((element) => {return element===idFilm})

        if(checkList !== undefined) {
          console.log("Check exist:", false)
          console.log('Add list: ',false)
          dataRes.checkList= false;
          res.send(dataRes)
        }
        else{
          dataRes.checkList= true;
          console.log("Check exist:", true)
          dataList.push(idFilm)
          console.log("dataList new: ",dataList)
          User.updateOne({_id: idUser}, {playlist: dataList})
          .then(() => {
            console.log('Add list: ',true)
            dataRes.addList= true;
            res.send(dataRes)
          })
        }
      })
})

app.post('/dellList', (req, res) => {
  console.log('Req data add list: ',req.body);
  const idUser = req.body.idUser
  const idFilm = req.body.idFilm

  User.find({ _id: idUser })
      .then ((user) => {
        const dataList = user[0].playlist;
        dataList.map((element, index) => {
          if(element === idFilm) {
            dataList.splice(index,1)
            console.log("dataList new: ",dataList)
            User.updateOne({_id: idUser}, {playlist: dataList})
            .then(() => {
              console.log('Dell list: ',true)
              res.send(true)
            })
          }
        })       
        
      })
})

app.post('/like', (req, res) => {
  console.log('Req data like: ',req.body);
  const idFilm = req.body.idFilm
  const idUser = req.body.idUser
  User.find({ _id: idUser })
  .then((user) => {
    const listLike = user[0].like;
    console.log('listLike User :',listLike)
    listLike.push(idFilm);
    User.updateOne({ _id: idUser },{like: listLike})
        .then(() => {
          console.log('=> Add film to user like list', true)
          res.send(true)
        })
    
  })
})
app.post('/unLike', (req, res) => {
  console.log('Req data unLike: ',req.body);
  const idFilm = req.body.idFilm
  const idUser = req.body.idUser
  User.find({ _id: idUser})
      .then ((user) => {
        const dataLike = user[0].like;
        dataLike.map((element,index) => {
          if(element === idFilm) {
            dataLike.splice(index, 1)
            console.log("dataLike new: ",dataLike)
            User.updateOne({_id: idUser}, {like: dataLike})
                .then(() => {
                  console.log('unLike: ',true)
                  res.send(true)
                })
          }
        })
      })
  
})

app.post('/upPoint',(req, res) => {
  console.log('Req up point: ',req.body);
  const idFilm = req.body.idFilm
  DataFilm.find({ _id: idFilm})
    .then((film) => {
      pointNew = film[0].point +1
      DataFilm.updateOne({ _id: idFilm},{point: pointNew})
      .then(() => {
        console.log('Up point', true)
      })
  })
  res.send(true)
})
app.post('/downPoint',(req, res) => {
  console.log('Req down point: ',req.body);
  const idFilm = req.body.idFilm
  DataFilm.find({ _id: idFilm})
    .then((film) => {
      pointNew = film[0].point -1
      DataFilm.updateOne({ _id: idFilm},{point: pointNew})
      .then(() => {
        console.log('Down point', true)
      })
  })
  res.send(true)
})

//Video films
app.get('/video', function (req, res) {
  console.log(req.query)
  const path = `assets/video/${req.query.id}.mp4`
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})