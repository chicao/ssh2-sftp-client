'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiSubset = require('chai-subset');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const {
  config,
  getConnection,
  closeConnection
} = require('./hooks/global-hooks');
const gHooks = require('./hooks/fastGet-hooks');
const {makeLocalPath, makeRemotePath} = require('./hooks/global-hooks');

chai.use(chaiSubset);
chai.use(chaiAsPromised);

describe('fastGet() method tests', function() {
  let hookSftp, sftp;

  before(function(done) {
    setTimeout(function() {
      done();
    }, config.delay);
  });

  before('FastGet setup hook', async function() {
    hookSftp = await getConnection('fastget-hook');
    sftp = await getConnection('fastget');
    await gHooks.fastGetSetup(hookSftp, config.sftpUrl, config.localUrl);
    return true;
  });

  after('FastGet cleanup hook', async function() {
    await gHooks.fastGetCleanup(hookSftp, config.sftpUrl, config.localUrl);
    await closeConnection('fastget', sftp);
    await closeConnection('fastget-hook', hookSftp);
    return true;
  });

  it('fastGet returns a promise', function() {
    return expect(
      sftp.fastGet(
        makeRemotePath(config.sftpUrl, 'fastget-promise.txt'),
        makeLocalPath(config.localUrl, 'fastget-promise.txt')
      )
    ).to.be.a('promise');
  });

  it('fastGet small text file', async function() {
    let localPath = makeLocalPath(config.localUrl, 'fastget-small.txt');
    let remotePath = makeRemotePath(config.sftpUrl, 'fastget-small.txt');
    await sftp.fastGet(remotePath, localPath, {encoding: 'utf8'});
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet large text file', async function() {
    let localPath = makeLocalPath(config.localUrl, 'fastget-large.txt');
    let remotePath = makeRemotePath(config.sftpUrl, 'fastget-large.txt');
    await sftp.fastGet(remotePath, localPath, {encoding: 'utf8'});
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet gzipped file', async function() {
    let localPath = makeLocalPath(config.localUrl, 'fastget-gzip.txt.gz');
    let remotePath = makeRemotePath(config.sftpUrl, 'fastget-gzip.txt.gz');
    await sftp.fastGet(remotePath, localPath);
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet non-existent file is rejected', function() {
    return expect(
      sftp.fastGet(
        makeRemotePath(config.sftpUrl, 'fastget-not-exist.txt'),
        makeLocalPath(config.localUrl, 'fastget-not-exist.txt')
      )
    ).to.be.rejectedWith('No such file');
  });

  it('fastGet remote relative path 1', async function() {
    let localPath = makeLocalPath(
      config.localUrl,
      'fastget-relative1-gzip.txt.gz'
    );
    let remotePath = './testServer/fastget-gzip.txt.gz';
    await sftp.fastGet(remotePath, localPath);
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet remote relative path 2', async function() {
    let localPath = makeLocalPath(
      config.localUrl,
      'fastget-relative2-gzip.txt.gz'
    );
    let remotePath = `../${config.username}/testServer/fastget-gzip.txt.gz`;
    await sftp.fastGet(remotePath, localPath);
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet local relative path 3', async function() {
    let localPath = './test/testData/fastget-relative3-gzip.txt.gz';
    let remotePath = makeRemotePath(config.sftpUrl, 'fastget-gzip.txt.gz');
    await sftp.fastGet(remotePath, localPath);
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });

  it('fastGet local relative path 4', async function() {
    let localPath =
      '../ssh2-sftp-client/test/testData/fastget-relative4-gzip.txt.gz';
    let remotePath = makeRemotePath(config.sftpUrl, 'fastget-gzip.txt.gz');
    await sftp.fastGet(remotePath, localPath);
    let stats = await sftp.stat(remotePath);
    let localStats = fs.statSync(localPath);
    return expect(localStats.size).to.equal(stats.size);
  });
});
