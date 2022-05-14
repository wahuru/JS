class Polynomial {
    constructor(poly = []) {
        this.poly = poly;
        this.poly.sort((a, b) => b.power - a.power);
    }

    getValue(x) {
        const calc = new Calculator;
        return this.poly.reduce( (s, elem) => 
            calc.add(s, calc.prod(calc.pow(x, elem.power), elem.value)),
            calc.zero( null, x )
        );
    }

    toStr(key) {
        return this.poly.map((el, i) => (el.value > 0) ? 
            `${i == 0 ? '' : '+'}${el[key]()}` :
            el[key]()).join('');
    }

    toString() {
        return this.toStr('toString')
    }

    toMath() {
        return this.toStr('toMath')
    }
}