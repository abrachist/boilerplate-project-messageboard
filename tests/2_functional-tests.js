const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Creating a new thread', (done) => {
        chai.request(server)
            .post('/api/threads/testSuiteBoard')
            .send({
                text: 'This is a test thread',
                delete_password: 'password!'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                done();
            })
    })

    test('Viewing the 10 most recent threads with 3 replies each', (done) => {
        chai.request(server)
            .get('/api/threads/testSuiteBoard')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isBelow(res.body.length, 11);
                for (let thread of res.body) {
                    assert.isArray(thread.replies);
                    assert.isBelow(thread.replies.length, 4);
                }
                done();
            })
    })

    test('Deleting a thread with the incorrect password', (done) => {
        chai.request(server)
            .get('/api/threads/testSuiteBoard')
            .end((err, res) => {
                let threadId = res.body[0]['_id']
                chai.request(server)
                    .delete('/api/threads/testSuiteBoard')
                    .send({
                        thread_id: threadId,
                        delete_password: 'password?'
                    })
                    .end((err1, res1) => {
                        assert.equal(res1.status, 200);
                        assert.equal(res1.text, 'incorrect password');
                        done();
                    })
            })
    });

    test('Deleting a thread with the correct password', (done) => {
        chai.request(server)
            .post('/api/threads/testSuiteBoard')
            .send({
                text: 'This is a test thread',
                delete_password: 'password!'
            })
            .end((err, res) => {
                chai.request(server)
                    .get('/api/threads/testSuiteBoard')
                            .end((err1, res1) => {
                                let threadId = res1.body[0]['_id']
                                chai.request(server)
                                    .delete('/api/threads/testSuiteBoard')
                                    .send({
                                        thread_id: threadId,
                                        delete_password: 'password!'
                                    })
                                    .end((err2, res2) => {
                                        assert.equal(res2.status, 200);
                                        assert.equal(res2.text, 'success');
                                        done();
                                    })
                            })
                    })
    })
        .timeout(10000);

    test('Reporting a thread', (done) => {
        chai.request(server)
            .post('/api/threads/testSuiteBoard')
            .send({
                text: 'This is a test thread',
                delete_password: 'password!'
            })
            .end((err, res) => {
                chai.request(server)
                    .get('/api/threads/testSuiteBoard')
                    .end((err1, res1) => {
                        let threadId = res1.body[0]['_id']
                        chai.request(server)
                            .put('/api/threads/testSuiteBoard')
                            .send({
                                report_id: threadId
                            })
                            .end((err2, res2) => {
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, 'reported');
                                done();
                            })
                    })
            })
    })
        .timeout(10000)

    test('Creating a new reply', (done) => {
        chai.request(server)
            .post('/api/replies/testSuiteBoard')
            .send({
                thread_id: 'BQBmOLfaqJgQLBLt7GAv',
                text: 'This is a test reply',
                delete_password: 'password!'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                done();
            })
    })

    test('Viewing a single thread with all replies', (done) => {
        chai.request(server)
            .get('/api/replies/testSuiteBoard?thread_id=BQBmOLfaqJgQLBLt7GAv')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.isArray(res.body.replies);
                done();
            })
    });

    test('Deleting a reply with the incorrect password', (done) => {
        chai.request(server)
            .get('/api/threads/testSuiteBoard')
            .end((err, res) => {
                let threadId = res.body[0]['_id']
                let replyId = res.body[0]['replies'][0]['_id']
                chai.request(server)
                    .delete('/api/replies/testSuiteBoard')
                    .send({
                        thread_id: threadId,
                        reply_id: replyId,
                        delete_password: 'password?'
                    })
                    .end((err1, res1) => {
                        assert.equal(res1.status, 200);
                        assert.equal(res1.text, 'incorrect password');
                        done();
                    })
            })
    }).timeout(10000);

    test('Deleting a reply with the correct password', (done) => {
        chai.request(server)
            .post('/api/replies/testSuiteBoard')
            .send({
                thread_id: 'BQBmOLfaqJgQLBLt7GAv',
                text: 'This is a test reply',
                delete_password: 'password!'
            })
            .end((err, res) => {
                chai.request(server)
                    .get('/api/threads/testSuiteBoard')
                    .end((err1, res1) => {
                        let threadId = res1.body[0]['_id']
                        let replyId = res1.body[0]['replies'][0]['_id']
                        chai.request(server)
                            .delete('/api/replies/testSuiteBoard')
                            .send({
                                thread_id: threadId,
                                reply_id: replyId,
                                delete_password: 'password!'
                            })
                            .end((err2, res2) => {
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, 'success');
                                done();
                            })
                    })
            })
    })
        .timeout(10000);

    test('Reporting a reply', (done) => {
        chai.request(server)
            .post('/api/replies/testSuiteBoard')
            .send({
                thread_id: 'BQBmOLfaqJgQLBLt7GAv',
                text: 'This is a test reply',
                delete_password: 'password!'
            })
            .end((err, res) => {
                chai.request(server)
                    .get('/api/replies/testSuiteBoard?thread_id=BQBmOLfaqJgQLBLt7GAv')
                    .end((err1, res1) => {
                        let threadId = res1.body['_id']
                        let replyId = res1.body['replies'][0]['_id']
                        chai.request(server)
                            .put('/api/replies/testSuiteBoard')
                            .send({
                                thread_id: threadId,
                                reply_id: replyId
                            })
                            .end((err2, res2) => {
                                assert.equal(res2.status, 200);
                                assert.equal(res2.text, 'reported');
                                done();
                            })
                    })
            })
    })
        .timeout(2500)
});
