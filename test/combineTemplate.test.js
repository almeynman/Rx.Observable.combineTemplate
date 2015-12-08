import Rx from 'rx';
import { expect } from 'chai';
import combineTemplate from '../src/combineTemplate';

describe('combineTemplate', () => {
  it('combines streams and properties according to a template object', () => {
    const name = Rx.Observable.just({ first: 'john', second: 'doe' });
    const other = { key : 'value' };
    combineTemplate({ name, other }).
      subscribe(x => expect(x).to.deep.equal({
        name: {
          first: 'john',
          second: 'doe',
        },
        other: {
          key: 'value',
        }
      }))
  });
  it('combines properties according to a template object', () => {
    const firstName = Rx.Observable.just("john");
    const lastName = Rx.Observable.just("doe");
    const username = Rx.Observable.just("mr.doe");
    combineTemplate({
      username,
      password: '*****',
      fullName: {
        firstName,
        lastName
      }
    }).subscribe(x => expect(x).to.deep.equal({
      username: 'mr.doe',
      password: '*****',
      fullName: {
        firstName: 'john',
        lastName: 'doe'
      }
    }))
  });
  it('works with a single stream object', () => {
    combineTemplate({
      key: Rx.Observable.just('value')
    }).subscribe(x => expect(x).to.deep.equal({key: 'value'}));
  });
  it('works with arrays as data', () => {
    combineTemplate({
      x: Rx.Observable.just([]),
      y: Rx.Observable.just([[]]),
      z: Rx.Observable.just(['z'])
    }).subscribe(x => expect(x).to.deep.equal({
      x: [],
      y: [[]],
      z: ['z']
    }))
  });
  it('supports empty objects', () => {
    combineTemplate({}).subscribe(x => expect(x).to.deep.equal({}));
  })
  it('supports arrays', () => {
    const value1 = { key: [{ x: 1 }, { x: 2 }]};
    combineTemplate(value1).subscribe(x =>
      expect(x).to.deep.equal(value1) &&
      expect(x.key instanceof Array).to.be.true
    );
    const value2 = [{ x: 1 }, { x: 2 }];
    combineTemplate(value2).subscribe(x =>
      expect(x).to.deep.equal(value2) &&
      expect(x.key instanceof Array).to.be.true
    );
    const value3 = { key: [{ x: 1 }, { x: 2 }], key2: {}};
    combineTemplate(value3).subscribe(x =>
      expect(x).to.deep.equal(value3) &&
      expect(x.key instanceof Array).to.be.true
    );
    const value4 = { key: [{ x: 1 }, { x: Rx.Observable.just(2) }]};
    combineTemplate(value4).subscribe(x =>
      expect(x).to.deep.equal({key: [{ x: 1 }, { x: 2 }]}) &&
      expect(x.key instanceof Array).to.be.true
    );
  });
  it('supports nulls', () => {
    const value = {key: null};
    combineTemplate(value).subscribe(x => expect(x).to.deep.equal(value));
  });
  it('supports NaNs', () => {
    const value = {key: NaN};
    combineTemplate(value).subscribe(x => expect(isNan(x.key)).to.be.true);
  });
  it('supports dates', () => {
    const value = {key: new Date()};
    combineTemplate(value).subscribe(x => expect(x).to.deep.equal(value));
  });
  it('supports regex', () => {
    const value = {key: /[0-0]/i};
    combineTemplate(value).subscribe(x => expect(x).to.deep.equal(value));
  });
  it('supports functions', () => {
    const value = {key: () => {}};
    combineTemplate(value).subscribe(x => expect(x).to.deep.equal(value));
  });
  it('uses original objects as values', () => {
    const Foo = () => {};
    Foo.prototype.do = () => {};
    const value = {foo1: new Foo(), foo2: Rx.Observable.just(new Foo())};
    combineTemplate(value).subscribe(({foo1, foo2}) =>
      expect(foo1).to.be.instanceof(Foo) &&
      expect(foo1).to.have.property('do') &&
      expect(foo2).to.be.instanceof(Foo) &&
      expect(foo2).to.have.property('do')
    )
  });
  // TODO
  // it('does not mutate original template objects', () => {
  //   const value = {key: Rx.Observable.from([1, 2])};
  //   combineTemplate(value).
  //     slidingWindow(2, 2).
  //     subscribe(([first, second]) => expect(first).to.not.equal(second));
  // })
});
