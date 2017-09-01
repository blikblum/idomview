var superviews = require('../index')

function addWrapper (content) {
  return ';(function () {' + '\n' + content + '\n' + '})()' + '\n'
}

describe('template', function () {
  describe('with static content', function () {
    it('should transpile simple element', function () {
      var expected = (
`var __target

return function description (data) {
elementOpen("div")
elementClose("div")
}`)
      var output = superviews('<div></div>')
      expect(output).toEqual(addWrapper(expected))
    })

    it('should transpile simple element with attributes', function () {
      var expected = (
`var __target
var hoisted1 = ["class", "header", "id", "title"]

return function description (data) {
elementOpen("h1", "xxxx-xxxx", hoisted1)
elementClose("h1")
}`)

      var output = superviews('<h1 class="header" id="title"></h1>')
      expect(output).toEqual(addWrapper(expected))
    })

    it('should reuse hoisted variables with same attributes', function () {
      var expected = (
        `var __target
var hoisted1 = ["class", "header", "id", "title"]
var hoisted2 = ["class", "header"]
var hoisted3 = ["class", "header", "id", "nav"]

return function description (data) {
elementOpen("h1", "xxxx-xxxx", hoisted1)
elementClose("h1")
elementOpen("h1", "xxxx-xxxx", hoisted1)
elementClose("h1")
elementOpen("h1", "xxxx-xxxx", hoisted2)
elementClose("h1")
elementOpen("h1", "xxxx-xxxx", hoisted3)
elementClose("h1")
}`)

      var output = superviews(`<h1 class="header" id="title"></h1>
<h1 id="title" class="header"></h1>
<h1 class="header"></h1>
<h1 class="header" id="nav"></h1>
`)
      expect(output).toEqual(addWrapper(expected))
    })

    it('should transpile void element', function () {
      var expected = (
`var __target

return function description (data) {
elementOpen("br")
elementClose("br")
}`)
      var output = superviews('<br/>')
      expect(output).toEqual(addWrapper(expected))
    })

    it('should transpile single line text', function () {
      var expected = (
`var __target

return function description (data) {
text("my text")
}`)
      var output = superviews('my text')
      expect(output).toEqual(addWrapper(expected))
    })

    it('should transpile multi line text', function () {
      var expected = (
`var __target

return function description (data) {
text("my very  \\
 long  \\
 text")
}`)
      var output = superviews('my very \n long \n text')
      expect(output).toEqual(addWrapper(expected))
    })
  })

  describe('with each attribute', function () {
    it('should transpile correctly', function () {
      var expected = (
        `var __target

return function description (data) {
__target = array
if (__target) {
  ;(__target.forEach ? __target : Object.keys(__target)).forEach(function($value, $item, $target) {
    var item = $value
    var $key = "xxxx-xxxx_" + $item
    elementOpen("li", $key)
    elementClose("li")
  }, this)
}
}`)
      var output = superviews('<li each="item in array"></li>')
      expect(output).toEqual(addWrapper(expected))
    })

    it('should handle custom key', function () {
      var expected = (
        `var __target

return function description (data) {
__target = array
if (__target) {
  ;(__target.forEach ? __target : Object.keys(__target)).forEach(function($value, $item, $target) {
    var item = $value
    var $key = "xxxx-xxxx_" + item.id
    elementOpen("li", $key)
    elementClose("li")
  }, this)
}
}`)
      var output = superviews('<li each="item, item.id in array"></li>')
      expect(output).toEqual(addWrapper(expected))
    })
  })

  describe('with each element', function () {
    it('should transpile correctly', function () {
      var expected = (
        `var __target

return function description (data) {
__target = array
if (__target) {
  ;(__target.forEach ? __target : Object.keys(__target)).forEach(function($value, $item, $target) {
    var item = $value
    var $key = "xxxx-xxxx_" + $item
    elementOpen("li", $key + "_1")
      elementOpen("div")
      elementClose("div")
    elementClose("li")
    elementOpen("li", $key + "_2")
    elementClose("li")
  }, this)
}
}`)
      var output = superviews(`<each expression="item in array">
  <li><div></div></li>
  <li></li>
</each>`)
      expect(output).toEqual(addWrapper(expected))
    })

    it('should handle custom key', function () {
      var expected = (
        `var __target

return function description (data) {
__target = array
if (__target) {
  ;(__target.forEach ? __target : Object.keys(__target)).forEach(function($value, $item, $target) {
    var item = $value
    var $key = "xxxx-xxxx_" + item.id
    elementOpen("li", $key + "_1")
      elementOpen("div")
      elementClose("div")
    elementClose("li")
    elementOpen("li", $key + "_2")
    elementClose("li")
  }, this)
}
}`)
      var output = superviews(`<each expression="item, item.id in array">
  <li><div></div></li>
  <li></li>
</each>`)
      expect(output).toEqual(addWrapper(expected))
    })

    it('should allow to nest if expression', function () {
      var expected = (
        `var __target

return function description (data) {
__target = array
if (__target) {
  ;(__target.forEach ? __target : Object.keys(__target)).forEach(function($value, $item, $target) {
    var item = $value
    var $key = "xxxx-xxxx_" + $item
    if (test) {
      elementOpen("li", $key + "_1")
        elementOpen("div")
        elementClose("div")
      elementClose("li")
    }
    elementOpen("li", $key + "_2")
    elementClose("li")
  }, this)
}
}`)
      var output = superviews(`<each expression="item in array">
  <li if="test"><div></div></li>
  <li></li>
</each>`)
      expect(output).toEqual(addWrapper(expected))
    })
  })

  describe('with script element', function () {
    it('should output the raw content', function () {
      var expected = (
        `var __target

return function description (data) {
var test = getData()
}`)
      var output = superviews('<script>var test = getData()</script>')
      expect(output).toEqual(addWrapper(expected))
    })

    describe('with hoisted attribute', function () {
      it('should hoist the raw content', function () {
        var expected = (
          `var test = require("test")
var __target

return function description (data) {

}`)
        var output = superviews('<script hoisted>var test = require("test")</script>')
        expect(output).toEqual(addWrapper(expected))
      })
    })
  })
})
