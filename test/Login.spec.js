'use strict';

describe('NodeAuthLocal Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Auth = require('../index');
    var schema = new mongoose.Schema();
    schema.plugin(Auth.plugin, {local: true, passport: require('passport')});
    var User = db.model('localmockuser', schema);

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
        it('Authenticate a valid user', function (done) {
            User.authenticateLocal({body: {email: 'test@test.com', password: 'password'}}, {}, function (err, result) {
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.email).toBe('test@test.com');
                    done(err);
                } else {
                    done('Error logging in user');
                }
            });
        });
    });

    describe('SHOULD NOT', function () {

        it('Authenticate an invalid email', function (done) {
            User.authenticateLocal({body: {email: 'testfake@test.com', password: 'password'}}, {}, function (err) {
                expect(err).not.toBeNull();
                if (err) {
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([
                        { field: 'email', reason: 'incorrect' },
                        { field: 'password', reason: 'incorrect' }
                    ]);
                }
                done();
            });
        });

        it('Authenticate without an email', function (done) {
            User.authenticateLocal({body: {password: 'password'}}, {}, function (err) {
                expect(err).not.toBeNull();
                if (err) {
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([
                        { field: 'email', reason: 'incorrect' },
                        { field: 'password', reason: 'incorrect' }
                    ]);
                }
                done();
            });
        });

        it('Authenticate an invalid password', function (done) {
            User.authenticateLocal({body: {email: 'test@test.com', password: 'wrongpassword'}}, {}, function (err) {
                expect(err).not.toBeNull();
                if (err) {
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([
                        { field: 'email', reason: 'incorrect' },
                        { field: 'password', reason: 'incorrect' }
                    ]);
                }
                done();
            });
        });

        it('Authenticate without a password', function (done) {
            User.authenticateLocal({body: {email: 'test@test.com'}}, {}, function (err) {
                expect(err).not.toBeNull();
                if (err) {
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([
                        { field: 'email', reason: 'incorrect' },
                        { field: 'password', reason: 'incorrect' }
                    ]);
                }
                done();
            });
        });
    });
});