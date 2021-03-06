"use strict";

var _ = require(".");

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('individual props', () => {
  test('fail on unknown type', () => {
    expect(() => (0, _.propFromDef)({
      type: 'whatever'
    })).toThrow();
  });
  describe('primitives', () => {
    test('string', () => {
      expect((0, _.propFromDef)({
        type: 'string'
      })).toBe(_propTypes.default.string);
    });
    test('boolean', () => {
      expect((0, _.propFromDef)({
        type: 'boolean'
      })).toBe(_propTypes.default.bool);
    });
    test('number', () => {
      expect((0, _.propFromDef)({
        type: 'number'
      })).toBe(_propTypes.default.number);
    });
    test('integer', () => {
      expect((0, _.propFromDef)({
        type: 'number'
      })).toBe(_propTypes.default.number);
    });
  });
  describe('array of strings', () => {
    let props;
    beforeEach(() => {
      props = {
        p: (0, _.propFromDef)({
          type: 'array',
          items: {
            type: 'string'
          }
        })
      };
    });
    test('no errors on success', () => {
      expect((0, _.check)(props, {
        p: ['an', 'array', 'of', 'strings']
      })).toEqual([]);
    });
    test('errors on failure', () => {
      expect((0, _.check)(props, {
        p: ['an', 'array', 'of', 4, 'strings']
      })).toHaveLength(1);
    });
  });
  describe('array of numbers', () => {
    let props;
    beforeEach(() => {
      props = {
        p: (0, _.propFromDef)({
          type: 'array',
          items: {
            type: 'number'
          }
        })
      };
    });
    test('no errors on success', () => {
      expect((0, _.check)(props, {
        p: [1, 2, 3, 4, 5, 6]
      })).toEqual([]);
    });
    test('errors on failure', () => {
      expect((0, _.check)(props, {
        p: [1, 2, 3, 4, '5', 6]
      })).toHaveLength(1);
    });
  });
  describe('enums', () => {
    let props;
    beforeEach(() => {
      props = {
        p: (0, _.propFromDef)({
          type: 'string',
          enum: ['one', 'two']
        })
      };
    });
    test('no errors on success', () => {
      expect((0, _.check)(props, {
        p: 'two'
      })).toEqual([]);
    });
    test('errors on failure', () => {
      expect((0, _.check)(props, {
        p: 'three'
      })).toHaveLength(1);
    });
  });
  describe('keyed objects', () => {
    let props;
    beforeEach(() => {
      props = {
        p: (0, _.propFromDef)({
          type: 'object',
          properties: {
            one: {
              type: 'string'
            },
            two: {
              type: 'boolean'
            },
            three: {
              type: 'string'
            }
          },
          required: ['two']
        })
      };
    });
    test('no errors on success', () => {
      const fn = () => (0, _.check)(props, {
        p: {
          one: 'a string',
          two: true,
          three: 'another string'
        }
      });

      expect(fn()).toEqual([]);
    });
    test('no errors on missing optional props', () => {
      expect((0, _.check)(props, {
        p: {
          two: true
        }
      })).toEqual([]);
    });
    test('errors on missing required props', () => {
      const fn = () => (0, _.check)(props, {
        p: {
          one: 'a string',
          three: 'another string'
        }
      });

      expect(fn()).toHaveLength(1);
    });
    test('errors on extra props', () => {
      const fn = () => (0, _.check)(props, {
        p: {
          two: false,
          four: 'I should not be here'
        }
      });

      expect(fn()).toHaveLength(1);
    });
  });
  describe('unkeyed objects', () => {
    let props;
    beforeEach(() => {
      props = {
        p: (0, _.propFromDef)({
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        })
      };
    });
    test('no errors on success', () => {
      const fn = () => (0, _.check)(props, {
        p: {
          one: 'a string',
          two: 'another string'
        }
      });

      expect(fn()).toEqual([]);
    });
    test('errors on wrong unkeyed type', () => {
      const fn = () => (0, _.check)(props, {
        p: {
          one: 'a string',
          two: 123
        }
      });

      expect(fn()).toHaveLength(1);
    });
  });
  describe('definition references', () => {
    let props;
    let refBase;
    beforeEach(() => {
      refBase = {
        SomeDef: {
          three: _propTypes.default.bool
        }
      };
      props = {
        p: (0, _.propFromDef)({
          type: 'object',
          properties: {
            one: {
              type: 'string'
            },
            two: {
              $ref: '#/definitions/SomeDef'
            }
          }
        }, refBase)
      };
    });
    test('no errors on success', () => {
      expect((0, _.check)(props, {
        p: {
          two: {
            three: true
          }
        }
      })).toEqual([]);
    });
    test('errors on failure', () => {
      expect((0, _.check)(props, {
        p: {
          two: 3
        }
      })).toHaveLength(1);
    });
  });
});
describe('full definitions', () => {
  let props;
  beforeEach(() => {
    props = (0, _.propsFromDefs)({
      DefOne: {
        type: 'object',
        properties: {
          one: {
            type: 'string'
          },
          two: {
            type: 'number'
          }
        },
        required: ['two']
      },
      DefTwo: {
        type: 'object',
        properties: {
          one: {
            type: 'boolean'
          },
          two: {
            type: 'string',
            enum: ['a', 'b', 'c']
          },
          three: {
            type: 'object',
            properties: {
              four: {
                type: 'string'
              },
              five: {
                type: 'string'
              }
            }
          }
        }
      }
    });
  });
  test('no errors on success (1)', () => {
    expect((0, _.check)(props.DefOne, {
      one: 'a string',
      two: 123
    })).toEqual([]);
  });
  test('no errors on success (2)', () => {
    expect((0, _.check)(props.DefTwo, {
      one: false,
      two: 'b'
    })).toEqual([]);
  });
  test('errors on failure - missing required prop', () => {
    expect((0, _.check)(props.DefOne, {
      one: 'a string'
    })).toHaveLength(1);
  });
  test('errors on failure - wrong prop type', () => {
    expect((0, _.check)(props.DefOne, {
      two: 'a string'
    })).toHaveLength(1);
  });
  test('no errors on success - nested props', () => {
    expect((0, _.check)(props.DefTwo, {
      three: {
        five: 'hello'
      }
    })).toEqual([]);
  });
  test('errors on failure - nested extra props', () => {
    expect((0, _.check)(props.DefTwo, {
      three: {
        six: 'hello'
      }
    })).toHaveLength(1);
  });
  test('errors on failure - wrong enum value', () => {
    expect((0, _.check)(props.DefTwo, {
      two: 'this is invalid'
    })).toHaveLength(1);
  });
  test('multiple failures reported', () => {
    expect((0, _.check)(props.DefTwo, {
      one: 'a string',
      two: 123
    })).toHaveLength(2);
  });
});
describe('non-object full definitions', () => {
  let props;
  beforeEach(() => {
    props = (0, _.propsFromDefs)({
      DefOne: {
        type: 'object',
        properties: {
          one: {
            type: 'string'
          },
          two: {
            type: 'number'
          }
        },
        required: ['two']
      },
      DefTwo: {
        type: 'object',
        properties: {
          one: {
            type: 'boolean'
          },
          two: {
            type: 'string',
            enum: ['a', 'b', 'c']
          },
          three: {
            type: 'object',
            properties: {
              four: {
                type: 'string'
              },
              five: {
                type: 'string'
              }
            }
          }
        }
      },
      DefThree: {
        type: 'string'
      }
    });
  });
  test('check() ignores non-object definition, even if correct', () => {
    expect((0, _.check)(props.DefThree, 'I am a string')).toEqual([]);
  });
  test('check() ignores non-object definition, even if incorrect', () => {
    expect((0, _.check)(props.DefThree, {
      thisIs: 'wrong'
    })).toEqual([]);
  });
});
describe('complex references', () => {
  let props;
  beforeEach(() => {
    props = (0, _.propsFromDefs)({
      Pet: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string'
          },
          tags: {
            type: 'array',
            items: {
              $ref: '#/definitions/Tag'
            }
          }
        }
      },
      Tag: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          }
        }
      }
    });
  });
  test('valid simple data should pass', () => {
    const pet = {
      name: 'My Pet'
    };
    expect((0, _.check)(props.Pet, pet)).toEqual([]);
  });
  test('valid nested data should pass', () => {
    const pet = {
      name: 'My Pet',
      tags: [{
        id: 1,
        name: 'cute'
      }, {
        id: 2,
        name: 'cuter'
      }, {
        id: 1,
        name: 'cutest'
      }]
    };
    expect((0, _.check)(props.Pet, pet)).toEqual([]);
  });
  test('invalid simple data should fail', () => {
    const pet = {
      NoName: 'My Pet'
    };
    expect((0, _.check)(props.Pet, pet)).toHaveLength(1);
  });
  test('invalid nested data should fail', () => {
    const pet = {
      name: 'My Pet',
      tags: [{
        id: 1,
        name: 'cute'
      }, {
        id: 'oops',
        name: 'cuter'
      }, {
        id: 1,
        name: 'cutest'
      }]
    };
    expect((0, _.check)(props.Pet, pet)).toHaveLength(1);
  });
});
describe('circular references', () => {
  let props;
  beforeEach(() => {
    props = (0, _.propsFromDefs)({
      Node: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string'
          },
          ancestors: {
            type: 'array',
            items: {
              $ref: '#/definitions/Node'
            }
          },
          descendants: {
            type: 'array',
            items: {
              $ref: '#/definitions/Node'
            }
          }
        }
      }
    });
  });
  test('circular definitions', () => {
    const node = {
      name: 'My node',
      ancestors: [{
        name: 'Parent A',
        ancestors: []
      }, {
        name: 'Parent B',
        ancestors: []
      }]
    };
    expect((0, _.check)(props.Node, node)).toEqual([]);
  });
  test('tight circular properties', () => {
    const node = {
      name: 'My node'
    };
    node.ancestors = [node];
    expect((0, _.check)(props.Node, node)).toEqual([]);
  });
  test('nested circular properties', () => {
    const node1 = {
      name: 'My node',
      ancestors: []
    };
    const node2 = {
      name: 'Another node',
      ancestors: [node1]
    };
    node1.ancestors.push(node2);
    expect((0, _.check)(props.Node, node1)).toEqual([]);
  });
  test('deeply nested circular properties', () => {
    const node1 = {
      name: 'My node',
      ancestors: []
    };
    const node2 = {
      name: 'Another node',
      ancestors: [node1]
    };
    const node3 = {
      name: 'Another node',
      ancestors: [node2]
    };
    node1.ancestors.push(node3);
    expect((0, _.check)(props.Node, node1)).toEqual([]);
  });
  test('invalid deeply nested circular properties should fail', () => {
    const node1 = {
      name: 'My node',
      ancestors: []
    };
    const node2 = {
      name: 'Another node',
      ancestors: [node1]
    };
    const node3 = {
      NotAname: 'Another node',
      ancestors: [node2]
    };
    node1.ancestors.push(node3);
    expect((0, _.check)(props.Node, node1)).toHaveLength(1);
  });
});
describe('checkExact', () => {
  let props;
  beforeEach(() => {
    props = (0, _.propsFromDefs)({
      Pet: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string'
          },
          tags: {
            type: 'array',
            items: {
              $ref: '#/definitions/Tag'
            }
          }
        }
      },
      Tag: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          }
        }
      }
    });
  });
  test('valid simple data should pass', () => {
    const pet = {
      name: 'My Pet'
    };
    expect((0, _.checkExact)('Pet', props.Pet, pet)).toEqual([]);
  });
  test('invalid simple data should fail', () => {
    const pet = {
      banana: true
    };
    expect((0, _.checkExact)('Pet', props.Pet, pet)).toHaveLength(1);
  });
  test('valid nested data should pass', () => {
    const pet = {
      name: 'My Pet',
      tags: [{
        id: 1,
        name: 'cute'
      }, {
        id: 2,
        name: 'cuter'
      }, {
        id: 3,
        name: 'cutest'
      }]
    };
    expect((0, _.checkExact)('Pet', props.Pet, pet)).toEqual([]);
  });
  test('invalid nested data should fail', () => {
    const pet = {
      name: 'My Pet',
      tags: [{
        id: 1,
        name: 'cute'
      }, {
        id: 'oops',
        name: 'cuter'
      }, {
        id: 1,
        name: 'cutest'
      }]
    };
    expect((0, _.checkExact)('Pet', props.Pet, pet)).toHaveLength(1);
  });
});