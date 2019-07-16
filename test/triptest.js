import http from 'chai-http';
import chai from 'chai';

chai.use(http);

const { expect } = chai;
const { protocol = 'http://', ip = '127.0.0.1', port = ':3000' } = process.env;
const url = protocol + ip + port;

// an admin
const admin = {
  bus_id: '005',
  origin: 'Lokoja',
  destination: 'Ilorin',
  trip_date: '2018-09-18',
  fare: '20.80',
  is_admin: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzcsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NjMyNzUwNjJ9.OiiF_mUvdD_Awlyt_jpDwbbuntV_fyRVomfs0Dpj5E8',
};

// a registered user
const user = {
  bus_id: '005',
  origin: 'Lokoja',
  destination: 'Ilorin',
  trip_date: '2018-09-18',
  fare: '20.80',
  is_admin: false,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzksImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNTYzMjc1MjcyfQ.tOemuvuvcBgvSIxPIE9WIjaQPC85Ycf-Whki04CZYXI',
};

// a visitor
const visitor = {
  bus_id: '005',
  origin: 'Lokoja',
  destination: 'Ilorin',
  trip_date: '2018-09-18',
  fare: '20.80',
  is_admin: true,
  token: '',
};

describe('view trips', () => {
  it('admin / should view all trips', (done) => {
    // send request to the app
    chai.request(url)
      .get('/api/v1/trips').send(admin)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });

  it('user / should view all trips', (done) => {
    chai.request(url)
      .get('/api/v1/trips').send(user)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });

  it('non users / should be denied access', (done) => {
    // send request to the app
    chai.request(url)
      .get('/api/v1/trips').send(visitor)
      .then((res) => {
        expect(res).to.have.status(400);
        expect(res.body).has.keys(['status', 'error']);
        done();
      })
      .catch(err => console.log(err));
  });
});

describe('create trips', () => {
  // create trip as admin
  it('admin/ should create new trips', (done) => {
    // send request to the app
    chai.request(url)
      .post('/api/v1/createtrips').send(admin)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        expect(res.body.data).has.keys(['trip_id', 'bus_id', 'destination', 'fare', 'origin', 'status', 'trip_date']);
        done();
      })
      .catch(err => console.log(err));
  });

  // create trip as user
  it('user/should show unauthorized acceess', (done) => {
    chai.request(url)
      .post('/api/v1/createtrips').send(user)
      .then((res) => {
        expect(res).to.have.status(400);
        expect(res.body).has.key(['status', 'error']);
        done();
      })
      .catch(err => console.log(err));
  });
});

describe('patch trip', () => {
  // as admin
  it('admin/ should cancel trip', (done) => {
    chai.request(url)
      .post('/api/v1/createtrips').send(admin)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).has.keys(['status', 'data']);
        done();
      })
      .catch(err => console.log(err));
  });

  // as user
  it('user/ should return denied access', (done) => {
    chai.request(url)
      .post('/api/v1/createtrips').send(user)
      .then((res) => {
        expect(res).to.have.status(400);
        expect(res.body).has.keys(['status', 'error']);
        done();
      })
      .catch(err => console.log(err));
  });
});
