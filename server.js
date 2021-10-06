const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient; 

var db;

MongoClient.connect('mongodb+srv://slyram06:lee146906@cluster0.fzore.mongodb.net/Cluster0?retryWrites=true&w=majority', function(err, client) {

  if (err) {
    return console.log(err)
  };

  db = client.db('community');

  app.listen((process.env.PORT || 8080) , function () {
    console.log('listening on 8080')
  });

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/write', function(req, res) {
  res.sendFile(__dirname + '/write.html')
});

app.delete('/editordelete', function(req, res) {
  req.body._id = parseInt(req.body._id);
  req.body.pwisit = parseInt(req.body.pwisit);

  db.collection('user').findOne(
    {
      _id: req.body._id
    },

    function (err, result) {
      console.log(result)
      var pwi = result.user_password
      var tit = result._id

      if (Number(pwi) == Number(req.body.pwisit)) {
        console.log(pwi)
        console.log(req.body.pwisit)
        
        db.collection('user').deleteOne({ _id: tit }, function (err, result) {
          res.status(200).send({
            message: '보내긴 보냈는데 왜 안 뜨는 거임;;;;'
          });
        });
      }
      else {
        res.status(400).send({
          message: '비번이 안 똑같음;;;;;;;;;;'
        });
      }
    }
  );
  });

app.get('/', function (req, res) {
  db.collection('user').find().toArray(function(err, result) {
    res.render('../list.ejs', {
      posts: result 
    });
  });
});

app.get('/menu', function (req, res) {
  res.render('../menu.ejs');
});

app.post('/add', function (req, res) {
  const today = new Date();   

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hour = today.getHours();
  const minute = today.getMinutes(); 
  const second = today.getSeconds();
  const msecond = today.getMilliseconds();

  const result_time = year + '' + month + '' + day + ''
                    + hour + '' + minute + '' + second + '' + msecond

  const showing_result_time = month + '월 ' + day + '일 ' + hour + '시 ' + minute + '분'

  db.collection('counter').findOne(
    {
      name: '게시물 갯수'
    }, 
  
  function(err, result) {
    var total = result.totalPost;

    db.collection('user').insertOne(
      {
        _id: total + 1,
        user_name: req.body.name,
        user_password: req.body.password,
        post_description: req.body.description,
        post_mbti: req.body.mbti_choose,
        upload_time: result_time,
        showing_date: showing_result_time
      },

      function (err, result) {
        console.log('Complete Upload!')

        db.collection('counter').updateOne(
          { name: '게시물 갯수' },
          { $inc: { totalPost: 1 } } , 
          function(err, result) {
            
          }
        )

      });
  });

  res.sendFile(__dirname + '/add.html');
});
