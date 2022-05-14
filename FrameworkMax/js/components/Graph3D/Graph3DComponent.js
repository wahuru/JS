class Graph3DComponent extends Component {
    constructor(options) {
        super(options);

        this.WIN = {
            LEFT: -10,
            BOTTOM: -10,
            WIDTH: 20,
            HEIGHT: 20,
            CAMERA: new Point(0, 0, 50),
            DISPLAY: new Point(0, 0, 30)
        }
        this.LIGHT = new Light(-45, 2, 0, document.getElementById('powerOfLight').value);
        this.canvas = new Canvas({
            WIN: this.WIN,
            id: 'canvas3D',
            callbacks: {
                wheel: event => this.wheel(event),
                mouseMove: event => this.mouseMove(event),
                mouseDown: event => this.mouseDown(event),
                mouseUp: () => this.mouseUp(),
                mouseLeave: () => this.mouseLeave()
            }
        });
        this.graph3D = new Graph3D({
            WIN: this.WIN
        });

        this.pointsAreAllowed = true;
        this.edgesAreAllowed = true;
        this.polygonsAreAllowed = true;
        this.lightSpinningAreAllowed = false;


        this.figureNumber = 0;
        this.dx = 0;
        this.dy = 0;
        this.canMove = false;
        this.figures = [(new Figure).singleHyperboloid()];
        this.figureAnimantion();
        this.lightSpinning();
        this.render();
    }

    _addEventListeners() {
        document.addEventListener('keydown', event => this.keyDownHandler(event));
        document.getElementById('addFigure').addEventListener('click', () => { this.figures.push((new Figure).sphere()); this.render() });
        document.getElementById('deleteFigure').addEventListener('click', () => { this.figures.pop(); this.render() });
        //checkboxes
        document.getElementById('isPoints').addEventListener('click', () => this.check('pointsAreAllowed'));
        document.getElementById('isEdges').addEventListener('click', () => this.check('edgesAreAllowed'));
        document.getElementById('isPolygons').addEventListener('click', () => this.check('polygonsAreAllowed'));
        document.getElementById('lightSpinning').addEventListener('click', () => this.check('lightSpinningAreAllowed'));
        document.getElementById('animation').addEventListener('click', () => this.check('animation'))
        //selectors
        document.getElementById('figures').addEventListener('change', () => this.selectFigure());
        document.getElementById('colorSelector').addEventListener('input', () => this.selectColor());
        document.getElementById('powerOfLight').addEventListener('input', () => this.powerOfLight());
        document.getElementById('arrow-right').addEventListener('click', () => {
            if (this.figureNumber < this.figures.length - 1) {
                this.figureNumber++;
            }
            document.querySelectorAll('.option').forEach(option => {
                option.removeAttribute('selected');
                if (this.figures[this.figureNumber].name == option.text) {
                    option.setAttribute('selected', 'selected')
                }
            });
        });
        document.getElementById('arrow-left').addEventListener('click', () => {
            if (this.figureNumber > 0) {
                this.figureNumber--;
            }
            document.querySelectorAll('.option').forEach(option => {
                option.removeAttribute('selected');
                if (this.figures[this.figureNumber].name == option.text) {
                    option.setAttribute('selected', 'selected')
                }
            });
        });
    }

    selectFigure() {
        const selectBox = document.getElementById('figures');
        this.figures[this.figureNumber] = (new Figure)[selectBox.options[selectBox.selectedIndex].text]();
        this.render();
    }

    figureAnimantion() {
        const gradus = -Math.PI / 720;
        setInterval(() => {
            if (this.animation && !this.canMove) {
                const matrix = this.graph3D.rotateOz(gradus);
                //console.log('doing smth');
                this.figures.forEach(figure => {
                    figure.points.forEach(point => {
                        this.graph3D.transform(matrix, point);
                    });
                });
                this.render();
            }
        }, 15)
    }

    lightSpinning() {
        let i = -Math.PI / 2;
        setInterval(() => {
            if (this.lightSpinningAreAllowed) {
                this.LIGHT.x = 45 * Math.sin(i);
                this.LIGHT.z = 45 * Math.cos(i);
                i += Math.PI / 48;
                this.render();
                i = (i > 2 * Math.PI) ? 0 : i;
            }
        }, 75)
    }

    selectColor() {
        this.figures.forEach(figure => {
            figure.polygons.forEach(polygon => {
                polygon.color = polygon.hexToRgb(document.getElementById('colorSelector').value);
            });
        });
        this.render();
    }
    powerOfLight() {
        this.LIGHT.lumen = document.getElementById('powerOfLight').value;
        this.render();
    }

    check(name) {
        this[name] = !this[name];
        this.render();
    }

    moveFigures(dx, dy, dz) {
        const matrix = this.graph3D.move(dx, dy, dz);
        this.figures.forEach(figure => {
            figure.points.forEach(point => {
                this.graph3D.transform(matrix, point);
            });
        });
        this.render();
    }

    // Always use keyCode
    keyDownHandler(event) {
        switch (event.keyCode) {
            case 65: // key a
                return this.moveFigures(-1, 0, 0);
            case 68: // key d
                return this.moveFigures(1, 0, 0);
            case 87: // key w
                return this.moveFigures(0, 1, 0);
            case 83: // key s
                return this.moveFigures(0, -1, 0);
        }
    }

    wheel(event) {
        event.preventDefault();
        const delta = (event.wheelDeltaY > 0) ? 1.1 : 0.9;
        const matrix = this.graph3D.zoom(delta);
        this.figures.forEach(figure => {
            figure.points.forEach(point => {
                this.graph3D.transform(matrix, point)
            });
        });
        this.render();
    }

    mouseMove(event) {
        if (this.canMove) {
            const gradus = Math.PI / 720;
            const matrixY = this.graph3D.rotateOy((this.dy - event.offsetY) * gradus);
            const matrixX = this.graph3D.rotateOx((this.dx - event.offsetX) * gradus);
            this.figures.forEach(figure => {
                figure.points.forEach(point => {
                    this.graph3D.transform(matrixY, point);
                    this.graph3D.transform(matrixX, point);
                });
            });
            this.dx = event.offsetX;
            this.dy = event.offsetY;
            this.render();
        }
    }

    mouseDown(event) {
        this.canMove = true;
        this.dx = event.offsetX
        this.dy = event.offsetY
    }

    mouseLeave() {
        this.canMove = false;
    }

    mouseUp() {
        this.canMove = false;
    }

    render() {
        this.canvas.clear();
        //polygon
        if (this.polygonsAreAllowed) {
            const polygons = [];
            this.figures.forEach((figure, index) => {
                this.graph3D.calcDisctance(figure, this.WIN.CAMERA, 'distance');
                this.graph3D.calcDisctance(figure, this.LIGHT, 'lumen');
                figure.polygons.forEach(polygon => {
                    polygon.figureIndex = index;
                    polygons.push(polygon);
                });
            });
            this.graph3D.sortByArtistAlgorithm(polygons);
            polygons.forEach(polygon => {
                const figure = this.figures[polygon.figureIndex];
                const points = polygon.points.map(point => {
                    return {
                        x : this.graph3D.xs(figure.points[point]),
                        y : this.graph3D.ys(figure.points[point])
                    }
                });
                const lumen = this.graph3D.clacIlluminationDistance(polygon.lumen, this.LIGHT.lumen);
                let {r, g, b} = polygon.color;
                r = Math.round(r * lumen);
                g = Math.round(g * lumen);
                b = Math.round(b * lumen);
                this.canvas.polygon(points, polygon.rgbToHex(r, g, b));
            });
        }
        //edges
        if (this.edgesAreAllowed) {
            this.figures.forEach(figure => {
                figure.edges.forEach(edge => {
                    const point1 = figure.points[edge.p1];
                    const point2 = figure.points[edge.p2];
                    this.canvas.line(
                        this.graph3D.xs(point1),
                        this.graph3D.ys(point1),
                        this.graph3D.xs(point2),
                        this.graph3D.ys(point2),
                        'lightgreen', 1
                    );
                });
            });
        }
        //points
        if (this.pointsAreAllowed) {
            this.figures.forEach(figure => {
                figure.points.forEach(point => {
                    this.canvas.point(this.graph3D.xs(point), this.graph3D.ys(point));
                });
            });
        }
    }
}

//Элипсоид, Однополостный гипреболоид, Двуполостный гипреболоид
//Конус, Элиптический параболоид, Гиперболический параболоид
//Элиптический цилиндр, Гиперболический цилиндр, Параболический цилиндр