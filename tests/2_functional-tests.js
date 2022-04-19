const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testThread_id;
let testReply_id;

suite('Functional Tests', function() {
  
    /*
    Create a New Thread
    POST request to /api/threads/:board
  */
    test('Creating a new thread: POST request to /api/threads/:board to create a new thread', (done) => {
      chai
        .request(server)
        .post('/api/threads/test-board')
        .set("content-type", "application/json")
        .send({ text: "test text", delete_password: "test" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.text, "test text");
          assert.equal(res.body.delete_password, "test");
          assert.equal(res.body.reported, false);
          testThread_id = res.body._id;
          done();
        });
    });

    /*
      View 10 most recent threads
      3 replies each
      GET request to /api/threads/:board
    */
    test('Test GET request to /api/threads/:board to view 10 most recent threads with 3 top replies', (done) => {
      chai
        .request(server)
        .get('/api/threads/test-board')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.exists(res.body[0], "There is a thread");
          assert.equal(res.body[0].text, "test text")
          done();
        });
    });

    /*
      Delete a thread with incorrect password 
      DELETE request to /api/threads/:board
      Invalid delete_password
    */
    test('Test DELETE request to /api/threads/:board to delete thread with incorrect password', (done) => {
      chai
        .request(server)
        .delete('/api/threads/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          delete_password: 'incorrect'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Incorrect Password");
          done();
        });
    });

    /*
      Report a thread (Update)
      PUT request to /api/threads/:board
    */
    test('Test PUT request to /api/threads/:board to report a thread', (done) => {
      console.log("testThread_id", testThread_id);
      chai
        .request(server)
        .put('/api/threads/test-board')
        .set("content-type", "application/json")
        .send({
          report_id: testThread_id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Success");
          done();
        });
    });

    /*
      Create a new reply
      POST request to /api/replies/:board
    */
    test('Test POST request to /api/replies/:board to create a new reply', (done) => {
      chai
        .request(server)
        .post('/api/replies/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          text: "test reply",
          delete_password: "testreply"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.threads[0].replies[0].text, "test reply");
          testReply_id = res.body.threads[0].replies[0]._id;
          done();
        });
    });

    /*
     View a single thread with ALL replies
     GET request to /api/replies/:board
   */
    test('Test GET request to /api/replies/:board to view a single thread with all replies', (done) => {
      chai
        .request(server)
        .get('/api/replies/test-board')
        .set("content-type", "application/json")
        .query({
          thread_id: testThread_id,
        }
        )
        .end((err, res) => {
          assert.equal(res.status, 200);
          console.log("test get whole thread body", res.body);
          assert.equal(res.body._id, testThread_id);
          assert.equal(res.body.text, "test text");
          assert.equal(res.body.replies[0].text, "test reply");
          done();
        });
    });

    /*
      Delete a reply with incorrect password
      DELETE request to /api/threads/:board
      Invalid delete_password
    */
    test('Test DELETE request to /api/replies/:board to delete a reply with incorrect password', (done) => {
      console.log("delete reply invalid ids: thread_id " +
        testThread_id +
        " _reply_id: " +
        testReply_id);
      chai
        .request(server)
        .delete('/api/replies/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          reply_id: testReply_id,
          delete_password: "Incorrect"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Incorrect Password');
          done();
        });
    });

    /*
      Reporting a Reply
      PUT request to /api/replies/:board
    */
    test('Test PUT request to /api/replies/:board to report a reply', (done) => {
      chai
        .request(server)
        .put('/api/replies/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          reply_id: testReply_id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Success");
          done();
        });
    });

    /*
      Delete a reply with correct password
      DELETE request to /api/threads/:board
      Valid delete_password
    */
    test('Test DELETE request to /api/replies/:board to delete a reply with correct password', (done) => {
      chai
        .request(server)
        .delete('/api/replies/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          reply_id: testReply_id,
          delete_password: "testreply"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Success");
          done();
        });
    });

    /*
      Delete a thread with correct password
      DELETE request to /api/threads/:board
      Valid delete_password
    */
    test('Test DELETE request to /api/threads/:board to delete thread with correct password', (done) => {
      chai
        .request(server)
        .delete('/api/threads/test-board')
        .set("content-type", "application/json")
        .send({
          thread_id: testThread_id,
          delete_password: "test"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Success");
          done();
        });
    });

}) 
