import http from 'chai-http';
import chai from 'chai';

chai.use(http);

const { expect } = chai;
const { protocol = 'http://', ip = '127.0.0.1', port = ':3000' } = process.env;
const url = protocol + ip + port;

// an admin
const admin = {
  trip_id: 25,
  is_admin: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzcsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NjMyNzUwNjJ9.OiiF_mUvdD_Awlyt_jpDwbbuntV_fyRVomfs0Dpj5E8',
};

// a registered user
const user = {
  trip_id: 25,
  is_admin: false,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzksImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNTYzMjc1MjcyfQ.tOemuvuvcBgvSIxPIE9WIjaQPC85Ycf-Whki04CZYXI',
};

// view bookings
describe('view bookings', () => {
  // as an admin
  it('admin / should return all bookings', (done) => {
    chai.request(url)
      .get('/api/v1/bookings').send(admin)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });

  // as a user
  it('users / should return users bookings', (done) => {
    chai.request(url)
      .get('/api/v1/bookings').send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });
});


// book seat
describe('book seat', () => {
  // as user
  it('user/ should book seat', (done) => {
    chai.request(url)
      .post('/api/v1/bookings').send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });
});


// delete bookings
describe('delete bookings', () => {
  // delete personal user booking
  it('user/ should delete personal booking', (done) => {
    chai.request(url)
      .delete(`/api/v1/bookings/${user.trip_id}`).send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.key(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });
});
