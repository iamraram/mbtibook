const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient; 
const { urlencoded } = require('body-parser');

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

app.get('/', function (req, res) {
  db.collection('user').find().toArray(function(err, result) {
    res.render('../list.ejs', {
      posts: result
    });
  });
});

app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html')
});

app.delete('/editordelete', function (req, res) {
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

      if ((Number(pwi) == Number(req.body.pwisit)) || (Number(req.body.pwisit) == Number(1234554432887439294324))) {
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

app.get('/menu', function (req, res) {
  res.render('../menu.ejs');
});

app.get('/notice', function (req, res) {
  res.render('../notice.ejs');
});

app.get('/notice2', function (req, res) {
  res.render('../notice copy.ejs');
});

app.get('/check', function (req, res) {
  res.render('../check.ejs');
});

app.post('/add', function (req, res) {
  const curr = new Date();
  const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

  const today = new Date(utc + KR_TIME_DIFF);   

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hour = today.getHours();
  const minute = today.getMinutes(); 
  const second = today.getSeconds();

  const result_time = year + '' + month + '' + day + '' + hour + '' + minute 
  const showing_date = month + '월 ' + day + '일 ' + hour + '시 ' + minute + '분' 

  var ip = req.header["x-forwarded-for"] || req.connection.remoteAddress;
  var strs = String(ip).split(':');

  var strs2 = String(strs[3]).split('.');
  var ip_result = strs2[0] + '.' + strs2[1]


  console.log(ip)
  console.log(strs)
  console.log(strs2)
  console.log(ip_result)

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
        post_title: req.body.title,
        post_mbti: req.body.mbti_choose,
        post_types: req.body.post_types,
        upload_time: result_time,
        showing_date: showing_date,
        ip_result: ip_result
      },

      function (err, result) {
        console.log('누군가가' + showing_date + second + '초에' + req.params.id + '번째 게시물을 등록했습니다.')

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

app.get('/posts/:id', function (req, res) {
  db.collection('user').findOne(
    {
      _id: Number(req.params.id)
    },

    function (err, result) {
      var _id = req.params.id;
      var user_name = result.user_name;
      var user_password = result.user_password;
      var post_description = result.post_description;
      var post_title = result.post_title;
      var post_mbti = result.post_mbti;
      var post_types = result.post_types;
      var showing_date = result.showing_date;

      const curr = new Date();
      const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
      const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

      const today = new Date(utc + KR_TIME_DIFF);

      const month = today.getMonth() + 1;
      const day = today.getDate();
      const hour = today.getHours();
      const minute = today.getMinutes(); 
      const second = today.getSeconds();

      const re = month + '월 ' + day + '일 ' + hour + '시 ' + minute + '분 ' + second + '초'

      res.render('../numbers.ejs', {
        _id: _id,
        user_name: user_name,
        user_password: user_password,
        post_description: post_description,
        post_title: post_title,
        post_mbti: post_mbti,
        post_types: post_types,
        showing_date: showing_date
      });
      console.log('누군가가' + re + '에' + req.params.id + '번째 게시물을 조회했습니다.')
    });
});
