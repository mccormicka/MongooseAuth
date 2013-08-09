'use strict';

describe('NodeAuthPassword Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Auth = require('../../index');
    var schema = new mongoose.Schema();
    schema.plugin(Auth.NodeAuthPlugin);
    var User = db.model('passwordmockuser', schema);

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
        it('Be able to acquire index', function () {
            var test = require('../../index');
            expect(test).not.toBeNull();
        });

        it('Update database with a reset link url', function (done) {
            User.createPasswordResetToken({email: 'test@test.com'}, function (err, result) {
                if (err) {
                    done(err);
                } else {
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.message).toBe('api.success.ok');
                        expect(result.data.model.email).toBe('test@test.com');
                        expect(result.data.token.href).toContain('?token=');
                        done(err);
                    }
                }
            });
        });

        it('Return true for a valid password', function (done) {
            model.isValidPassword('password', function(err, result){
                expect(err).toBeNull();
                expect(result).toBe(true);
                done(err);
            });
        });

        it('Return false for an invalid password', function (done) {
            model.isValidPassword('wrongpassword', function(err, result){
                expect(err).toBeNull();
                expect(result).toBe(false);
                done(err);
            });
        });
    });

    describe('SHOULD NOT', function () {
        it('Allow a non registered account to create a reset token', function (done) {
            User.createPasswordResetToken({email: 'fake@test.com'}, function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

        it('Allow an invalid query to create a reset token.', function (done) {
            User.createPasswordResetToken({email: ''}, function (err) {
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    done();
                } else {
                    done('Error registering account');
                }
            });
        });

    });
});