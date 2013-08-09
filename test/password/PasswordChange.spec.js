'use strict';

describe('NodeAuthPassword Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Auth = require('../../index');
    var schema = new mongoose.Schema();
    schema.plugin(Auth.NodeAuthPlugin);
    var User = db.model('passwordchangemockuser', schema);

    var model;
    var token;

    beforeEach(function (done) {
        mockgoose.reset();
        User.register('test@test.com', 'password', function (err, result) {
            if (err) {
                done(err);
            } else {
                model = result;
                createToken(done);
            }
        });
    });

    function createToken(done) {
        User.createPasswordResetToken({email: 'test@test.com'}, function (err, result) {
            if (err) {
                done(err);
            } else {
                expect(result).not.toBeNull();
                if (result) {
                    token = result.data.token.token;
                    done(err);
                }
            }
        });
    }

    describe('SHOULD', function () {

        it('Change a users password', function (done) {
            model.changePassword('updatedpassword', function(err, result){
                expect(err).toBeNull();
                expect(result).not.toBeNull();
                if(result){
                    model.isValidPassword('updatedpassword', function(err, result){
                        expect(err).toBeNull();
                        expect(result).toBe(true);
                        done(err);
                    });
                }else{
                    done(err);
                }
            });
        });

        it('Change a users password with a valid token', function (done) {
            expectValidPasswordChange(done);
        });
    });

    describe('SHOULD NOT', function () {

        it('Change a users password with an invalid token', function (done) {
            User.changePassword('test@test.com','updatedpassword', 'faketokenthatshouldnotwork', function(err){
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([{ field : 'token', reason : 'expired' }]);
                }
                done();
            });
        });

        it('Change a users password with a missing token', function (done) {
            User.changePassword('test@test.com','updatedpassword', '', function(err){
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([{ field : 'token', reason : 'expired' }]);
                }
                done();
            });
        });

        it('Change the password with the same token twice', function (done) {
            expectValidPasswordChange(function(err){
                if(err){
                    done(err);
                }else{
                    User.changePassword('test@test.com', 'tryingagain', token, function(err){
                        expect(err).not.toBeNull();
                        if(err){
                            expect(err.message).toBe('api.error.invalid.params');
                            expect(err.data).toEqual([ { field : 'token', reason : 'expired' } ]);
                            User.findOne({email:'test@test.com'}, function(err, result){
                                if(err){
                                    done(err);
                                }else{
                                    result.isValidPassword('tryingagain', function(err, result){
                                        expect(err).toBeNull();
                                        expect(result).toBe(false);
                                        done();
                                    });
                                }
                            });
                        }else{
                            done();
                        }
                    });
                }
            });
        });

        it('Change a users password with an invalid email', function (done) {
            User.changePassword('test@test', 'tryingagain', token, function(err){
                expect(err).not.toBeNull();
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field : 'email', reason : 'invalid' } ]);
                    User.findOne({email:'test@test.com'}, function(err, result){
                        if(err){
                            done(err);
                        }else{
                            result.isValidPassword('tryingagain', function(err, result){
                                expect(err).toBeNull();
                                expect(result).toBe(false);
                                done();
                            });
                        }
                    });
                }else{
                    done();
                }
            });
        });

        it('Change a users password with an invalid password', function (done) {
            User.changePassword('test@test.com', '', token, function(err){
                expect(err).not.toBeNull();
                console.log('Error is ', err);
                if(err){
                    expect(err.message).toBe('api.error.invalid.params');
                    expect(err.data).toEqual([ { field : 'password', reason : 'required' } ]);
                    User.findOne({email:'test@test.com'}, function(err, result){
                        if(err){
                            done(err);
                        }else{
                            result.isValidPassword('', function(err, result){
                                expect(err).toBeNull();
                                expect(result).toBe(false);
                                done();
                            });
                        }
                    });
                }else{
                    done();
                }
            });
        });
    });


    function expectValidPasswordChange(done) {
        User.changePassword('test@test.com', 'updatedpassword', token, function (err, result) {
            expect(err).toBeNull();
            expect(result).not.toBeNull();
            if (result) {
                User.findOne({email: 'test@test.com'}, function (err, result) {
                    result.isValidPassword('updatedpassword', function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBe(true);
                        done(err);
                    });
                });
            } else {
                done(err);
            }
        });
    }
});