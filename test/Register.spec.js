'use strict';

describe('NodeAuthPlugin Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Auth = require('../index');
    var schema = new mongoose.Schema();
    schema.plugin(Auth.plugin);
    var User = db.model('registermockuser', schema);

    var model;

    beforeEach(function (done) {
        mockgoose.reset();
        User.register('test@test.com', 'password', function (err, result) {
            if (err) {
                done(err);
            } else {
                model = result;
                done();
            }
        });
    });

    describe('SHOULD', function () {

        it('Be able to register a new user', function (done) {
            User.register('test2@test.com', 'password', function (err, result) {
                if (err) {
                    done(err);
                } else {
                    model = result;
                    done();
                }
            });
        });

        it('Encrypt the users password in the database', function (done) {
            User.findOne({email:'test@test.com'}, function(err, result){
                expect(err).toBeNull();
                if(result){
                    expect(result.password).not.toBe('password');
                    result.isValidPassword('password', function(err, result){
                        expect(err).toBeNull();
                        expect(result).toBe(true);
                        done();
                    });
                }else{
                    done(err);
                }
            });
        });
    });


    describe('SHOULD NOT', function () {

        it('Be able to register with a duplicate email', function (done) {
            User.register('test@test.com', 'password', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.conflict');
                    expect(err.data).toEqual([ { field: 'email', reason: 'duplicate' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register without an email', function (done) {
            User.register('', 'password', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field: 'email', reason: 'required' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register with a email array', function (done) {
            User.register(['test2@testing.com', 'test3@testing.com'], 'password', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field: 'email', reason: 'invalid' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register with an invalid email format', function (done) {
            User.register('notarealemailaddress.com', 'password', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field: 'email', reason: 'invalid' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register without a password', function (done) {
            User.register('testing@testing.com', '', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field: 'password', reason: 'required' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register with a short password', function (done) {
            User.register('testing@testing.com', '12345', function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field : 'password', reason : 'min.length:6' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Be able to register with a password array', function (done) {
            User.register('testing@testing.com', ['12345', 'password'], function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field : 'password', reason : 'invalid' } ]);
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

    });
});
