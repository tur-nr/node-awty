var awty = require('../')
  , doubler = require('../doubler')
  , isval = require('isval')
  , assert = require('assert')
  , TIMEOUT_BUFFER = 10;

function error() {
  throw new Error('test timeout exhausted');
} 

describe('awty()', function() {
  it('should throw an exception if no polling function given', function() {
    assert.throws(function() { awty(); }, SyntaxError);
    assert.throws(function() { awty(''); }, TypeError);
    assert.throws(function() { awty(true); }, TypeError);
    assert.throws(function() { awty(1); }, TypeError);
    assert.throws(function() { awty({}); }, TypeError);
    assert.throws(function() { awty([]); }, TypeError);
    assert.throws(function() { awty(null); }, TypeError);
    assert.throws(function() { awty(undefined); }, TypeError);
    assert.throws(function() { awty(NaN); }, TypeError);
  });

  it('should return a polling instance', function() {
    var poll = awty(function() {});

    assert.ok(isval(poll, 'function'));

    [poll.ask, poll.every, poll.incr].forEach(function(fn) {
      assert.ok(isval(fn, 'function'));
    });
  });
});

describe('awty#()', function() { 
  it('should poll once and callback sucess', function(done) {
    var poll = awty(function() { return true; })
      , timeout;

    poll(function(fin) {
      clearTimeout(timeout);
      assert.ok(fin);
      done();
    }); 

    timeout = setTimeout(error, 1000 + TIMEOUT_BUFFER);
  });
});

describe('awty#(next)', function() {
  it('should poll once and callback sucess', function(done) {
    var poll = awty(function awty_next(next) {
      setTimeout(function() {
        next(true);
      }, 100);
    })
      , timeout;

    poll.every(100);

    poll(function(fin) {
      clearTimeout(timeout);
      assert.ok(fin);
      done();
    });

    timeout = setTimeout(error, 1000 + TIMEOUT_BUFFER);
  });
});

describe('awty#ask()', function() {
  it('should set an ask limit', function(done) {
    var poll = awty(function() { return ++i >= 3; })
      , i = 0;

    assert.strictEqual(poll, poll.ask(3)); 
    assert.throws(function() { poll.ask(); }, TypeError);
    assert.throws(function() { poll.ask(''); }, TypeError);
    assert.throws(function() { poll.ask(true); }, TypeError);
    assert.throws(function() { poll.ask({}); }, TypeError);
    assert.throws(function() { poll.ask([]); }, TypeError);
    assert.throws(function() { poll.ask(null); }, TypeError);
    assert.throws(function() { poll.ask(undefined); }, TypeError);
    assert.throws(function() { poll.ask(NaN); }, TypeError);

    poll.every(100);
    
    poll(function(fin) {
      assert.ok(fin);
      assert.equal(i, 3); 
      
      // ask limit exhausted
      i = -3;
      poll(function(fin) {
        assert.ok(!fin);
        done();
      });
    }); 
  });
});

describe('awty#every()', function() {
  it('should set an every timeout', function(done) {
    var poll = awty(function() { return ++i >= 3; })
      , every = 100
      , i = 0
      , timeout;
    
    poll = awty(function() {
      clearTimeout(timeout);
      timeout = setTimeout(error, every + TIMEOUT_BUFFER);
      return ++i >= 3;
    }); 

    assert.strictEqual(poll, poll.every(every)); 
    assert.throws(function() { poll.every(); }, TypeError);
    assert.throws(function() { poll.every(''); }, TypeError);
    assert.throws(function() { poll.every(true); }, TypeError);
    assert.throws(function() { poll.every({}); }, TypeError);
    assert.throws(function() { poll.every([]); }, TypeError);
    assert.throws(function() { poll.every(null); }, TypeError);
    assert.throws(function() { poll.every(undefined); }, TypeError);
    assert.throws(function() { poll.every(NaN); }, TypeError);

    poll(function(fin) {
      clearTimeout(timeout);
      assert.ok(fin);
      done();
    }); 

    timeout = setTimeout(error, every + TIMEOUT_BUFFER);
  });
});

describe('awty#incr()', function() {
  it('should set an incremental timeout', function(done) {
    var i = 0
      , every = 100
      , poll
      , timeout;

    poll = awty(function() {
      clearTimeout(timeout);
      timeout = setTimeout(error, doubler(every, ++i) + TIMEOUT_BUFFER);
      return i >= 3;
    });
    
    assert.strictEqual(poll, poll.incr()); 
    assert.strictEqual(poll, poll.incr(true)); // same as above
    
    assert.throws(function() { poll.incr(''); }, TypeError);
    assert.throws(function() { poll.incr({}); }, TypeError);
    assert.throws(function() { poll.incr([]); }, TypeError);
    assert.throws(function() { poll.incr(null); }, TypeError);
    assert.throws(function() { poll.incr(undefined); }, TypeError);
    assert.throws(function() { poll.incr(NaN); }, TypeError);

    poll.every(every);

    poll(function(fin) {
      clearTimeout(timeout);
      assert.ok(fin);
      done();
    }); 

    timeout = setTimeout(error, every + 10);
  });

  it('should set an incremental ms', function(done) {
    var i = 0
      , every = 100
      , incr = 150
      , poll
      , timeout;

    poll = awty(function() {
      clearTimeout(timeout);
      timeout = setTimeout(error, ((++i * incr) + every) + TIMEOUT_BUFFER);
      return i >= 3;
    });
    
    assert.strictEqual(poll, poll.incr(incr)); 

    poll.every(every);

    poll(function(fin) {
      clearTimeout(timeout);
      assert.ok(fin);
      done();
    }); 

    timeout = setTimeout(error, every + TIMEOUT_BUFFER);
  });
});
