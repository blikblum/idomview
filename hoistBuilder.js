class HoistBuilder {
  constructor () {
    this.map = new Map()
    this.count = 0
    this.contents = []
  }

  addStatics (statics) {
    let result = this.map.get(statics)
    if (!result) {
      this.count++
      result = `hoisted${this.count}`
      this.map.set(statics, result)
    }
    return result
  }

  addLiteral (literal) {
    this.contents.push(literal)
  }

  build () {
    let result = this.contents.join('\n')
    this.map.forEach((value, key) => {
      result += `\nvar ${value} = ${key}`
    })
    return result
  }

  clear () {
    this.map.clear()
    this.count = 0
    this.contents = []
  }
}

module.exports = new HoistBuilder()
