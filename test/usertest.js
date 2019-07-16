import http from 'chai-http';
import chai from 'chai';

chai.use(http);
const { expect } = chai;
const { protocol = 'http://', ip = '127.0.0.1', port = ':3000' } = process.env;
const url = protocol + ip + port;

const user = {
  email: 'myemail45@wayfarer.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'abcd1234',
};

describe('auth signup', () => {
  it('signup / should return 200 and a json object', (done) => {
    // send request to the app
    chai.request(url)
      .post('/api/v1/auth/signup').send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.key(['status', 'error']);
        // expect(res.body.data).has.keys(['user_id', 'is_admin', 'token']);
        done();
      })
      .catch(err => err);
  });
});

describe('auth singin', () => {
  it('signin / should sign in user and return user details', (done) => {
  // send request to the app
    chai.request(url)
      .post('/api/v1/auth/signin').send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.key(['status', 'message', 'data']);
        expect(res.body.data).has.keys(['user_id', 'is_admin', 'token']);
        expect(res.body.message).equals('successfully logged in');
        done();
      })
      .catch(err => err);
  });
});
