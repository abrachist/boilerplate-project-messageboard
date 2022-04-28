'use strict';
/*const Firestore = require('@google-cloud/firestore');
const admin = require('firebase-admin');
const log = require('simple-node-logger').createSimpleLogger();
const bcrypt = require('bcrypt');*/
const bodyParser = require('body-parser');
const crypto = require('crypto');

/*const HASHES = 12

log.setLevel('debug');

const db = new Firestore({
  projectId: 'messageboard-b3821',
  keyFilename: './service-key.json'
})

const boardCollection = db.collection('boards');*/

const threads = [];

module.exports = function (app) {
   app.use(bodyParser({extended: false}));
  
  
  // route to add new thread
app.route('/api/threads/:board').post(function(req, res) {
  bodyParser.json();
 
  const board = req.params.board;
  const text = req.body.text;
  const delete_password = req.body.delete_password;
  let id = crypto.randomBytes(8).toString("hex");
  let date = new Date();

  if (board !== "") {   
    
    const newThreadObj = {
      "_id": id,
      "board": board,
      "text": text,
      "delete_password": delete_password,
      "created_on": date,
      "bumped_on": date,
      "reported":  false,
      "replies": []
    };

    console.log("New thread: " + board + " and id: " + id);

    threads.unshift(newThreadObj);
    console.log(newThreadObj);
    res.send(newThreadObj);
    // res.redirect('/b/'+board);
    return;

  }
  
});

// route to get all thread
app.route('/api/threads/:board').get(function (req, res) {
  let result = [];  
  threads.forEach(val => {
    result.push({
      "_id": val["_id"],
      "board": val["board"],
      "text": val["text"],
      "created_on": val["created_on"],
      "bumped_on": val["bumped_on"],
      "replies": val["replies"].map(item => {
        return  {"_id": item["_id"],
        "text": item["text"],
        "created_on": item["created_on"]
        }
      })
    });
  })
  result.sort((a,b) => b.bumped_on - a.bumped_on).slice(0,10);

  result.map(val => {
    return val["replies"].slice(0,3);
  })
  console.log("Show 10 threads");
  console.log(result);
  res.send(result);
  return;
  // res.redirect('/b/'+req.body.board);
  
});

// route delete thread
app.route('/api/threads/:board').delete(function (req, res){
  bodyParser.json(); 
  const board = req.params.board;
  const id = req.body.thread_id;
  const delete_password = req.body.delete_password;
  let el = threads.findIndex(val => {
    return val._id == id;
  });
  if(el > -1){
    if(threads[el].delete_password === delete_password) {
      threads.splice(el,1);
      res.send('success');
      return;
    } else {
      res.send('incorrect password');
      return;
    }
    
  } else {
    res.send('incorrect password');
    return;
  }
});

  // route report thread
app.route('/api/threads/:board').put(function (req, res){
  bodyParser.json(); 
  
  const board = req.params.board;
  const id = req.body.report_id;
  let el = threads.findIndex(val => {
    return val._id == id;
  });
  
  if(el > -1){
      threads[el].reported = true;
      console.log(threads[el]);
      res.send('reported');
      return;
  } else {
    res.send('incorrect password');
    return;
  }
});
  
// route to add new replies
app.route('/api/replies/:board').post(function (req, res) {
  bodyParser.json();
  const board = req.params.board;
  const text = req.body.text;
  const delete_password = req.body.delete_password;
  let id = req.body.thread_id;
  let reply_id = crypto.randomBytes(8).toString("hex");
  let date = new Date();

  let el = threads.findIndex(val => {
    return val._id = id;
  });
  
  if (el > -1) {   
    
    const newReplyObj = {
      "_id": reply_id,
      "text": text,
      "created_on": date,
      "delete_password": delete_password,
      "reported":  false
    };

    threads[el].replies.unshift(newReplyObj);
    threads[el].bumped_on = date;

    console.log("New reply: " + text + " and id: " + reply_id);
    console.log(newReplyObj);
    res.redirect('/api/replies/'+ board +'?thread_id='+id);
    return;

  }
});

// route get reply
app.route('/api/replies/:board').get(function (req, res) {
    bodyParser.json();
    const board = req.params.board;
    const thread = req.query.thread_id;

    let el = threads.findIndex(val => {
      return val._id = thread;
    });
  
  if(el > -1){
    console.log("Show 1 threads with all threads replies");
    console.log(threads[el]);    
    res.send({
      "_id": threads[el]["_id"],
      "board": threads[el]["board"],
      "text": threads[el]["text"],
      "created_on": threads[el]["created_on"],
      "bumped_on": threads[el]["bumped_on"],
      "replies": threads[el]["replies"].map(item => {
        return  {"_id": item["_id"],
        "text": item["text"],
        "created_on": item["created_on"]
        }
      }) });
    res.redirect('/b/'+ board +'/'+ thread);
    return;
  } else {
    let result = [];  
    threads.forEach(val => {
      result.push({
        "_id": val["_id"],
        "board": val["board"],
        "text": threads[el]["text"],
        "created_on": val["created_on"],
        "bumped_on": val["bumped_on"],
        "replies": val["replies"].map(item => {
          return  {"_id": item["_id"],
          "text": item["text"],
          "created_on": item["created_on"]
          }
        })
      });
    })
    console.log("Show all threads with all threads replies");
    res.send(result);
    res.redirect('/b/general');
    return;
    }
})

// route delete reply
app.route('/api/replies/:board').delete(function (req, res){
  bodyParser.json(); 
  const board = req.params.board;
  const id = req.body.thread_id;
  const replyid = req.body.reply_id;
  const delete_password = req.body.delete_password;
  
  let el = threads.findIndex(val => {
    return val["_id"] = id;
  });
  
  if(el > -1){
    console.log(threads[el].replies);
    console.log(replyid);
    let el2 = threads[el].replies.findIndex(ret => {
      return ret["_id"] == replyid;
    });

    console.log(el2);
    
    if(el2 == undefined || el2 <= -1){
      res.send('incorrect password');
      return;
    }

    if(threads[el].replies[el2].delete_password === delete_password) {
      threads[el].replies[el2].text="[deleted]";
      res.send('success');
      return;
    } else {
      res.send('incorrect password');
      return;
    }
    
  } else {
    res.send('incorrect password');
    return;
  }
});

// route report reply
app.route('/api/replies/:board').put(function (req, res){
  bodyParser.json(); 
  const board = req.params.board;
  const id = req.body.thread_id;
  const replyid = req.body.reply_id;
  let el = threads.findIndex(val => {
    return val._id = id;
  });
  console.log(el);
  if(el > -1){
    let el2 = threads[el].replies.findIndex(val => {
      return val._id == replyid;
    });
    console.log(el2);
    if(el2 == 'undefined' || el2 < -1){
      res.send('incorrect password');
      return;
    }
    
      threads[el].replies[el2].reported=true;
      res.send('reported');
      return;
 } else {
    res.send('incorrect password');
    return;
  }
});
  
};
