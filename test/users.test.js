'use strict';
const mongoose = require('mongoose');
const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/config');
const { User } = require('../models/User');

chai.use(chaiHttp);

function tearDownDB() {
  console.warn('...Deleting Database...');
  return new Promise((resolve, reject) => {
    mongoose.connection
      .dropDatabase()
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        //console.error(err);
        reject(err);
      });
  });
}

function createFakeUser() {
  let password = faker.internet.password();
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: faker.internet.email(),
    password: password,
    password2: password
  };
}

describe('\n========================\nAuthentication Endpoints\n========================\n', function() {
  let testUser, jwtToken;

  before(async () => {
    await runServer();
  });

  after(async () => {
    await tearDownDB();
    await closeServer();
  });

  describe('\n----------\nPOST /api/users/register\n----------\n', () => {
    // Create a user for our tests

    testUser = createFakeUser();

    // test signup route
    it('Should fail if required fields are blank', () => {
      return chai
        .request(app)
        .post('/api/users/register')
        .send({
          name: '',
          email: '',
          password: '',
          password2: ''
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys(
            'name',
            'email',
            'password',
            'password2'
          );
          expect(res.body.name).to.equal('Name field is required');
        });
    });

    it('Should create a user for a proper request', function() {
      return chai
        .request(app)
        .post('/api/users/register')
        .send(testUser)
        .then(res => {
          jwtToken = res.body.token;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('Object');
          // expect(res.body).to.have.keys(
          //   '_id',
          //   'name',
          //   'email',
          //   'password',
          //   'date',
          //   '__v'
          // );
        });
    });

    it('Should fail is the email addess is already in use', function() {
      return chai
        .request(app)
        .post('/api/users/register')
        .send(testUser)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.key('email');
          expect(res.body.email).to.equal('Email already exists');
        });
    });
  });

  describe('\n----------\nPOST /api/users/login\n----------\n', () => {
    //test signin route
    const signInBadEmail = {
      email: 'not@good.com',
      password: testUser.password
    };

    const signInBadPass = {
      email: testUser.email,
      password: 'pumpernickle'
    };

    const goodUser = {
      email: testUser.email,
      password: testUser.password
    };

    it('Should fail if email is incorrect', function() {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(signInBadEmail)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('Should fail is password is incorrect', function() {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(signInBadPass)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('Should succeed if credientals are correct', function() {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(testUser)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys('token', 'success');
        });
    });
  });

  // Future Use
  // describe('\n----------\nPOST /refresh\n----------\n', () => {
  //   // test refresh route
  //   it('Should succeed in providing a new token', function() {
  //     return chai
  //       .request(app)
  //       .post('/refresh')
  //       .set('Authorization', `Bearer ${jwtToken}`)
  //       .then(res => {
  //         expect(res).to.have.status(200);
  //         expect(res.body).to.be.an('Object');
  //         expect(res.body).to.have.key('token');
  //       });
  //   });
  // });
});
