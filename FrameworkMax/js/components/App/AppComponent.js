class AppComponent extends Component {
    constructor(options) {
        super(options);
        this.header = new HeaderComponent({
            id: 'header',
            parent: this.id,
            template: template.headerTemplate,
            callbacks: {
                showComponent:
                    (name) => this.showComponent(name)
            }
        });
        this.graph2D = new Graph2DComponent({
            id: 'graph2D',
            parent: this.id,
            template: template.graph2DTemplate,
            className: 'hide'
        });
        this.graph3D = new Graph3DComponent({
            id: 'graph3D',
            parent: this.id,
            template: template.graph3DTemplate,
            className: 'hide'
        });
        this.calculator = new CalculatorComponent({
            id: 'calculator',
            parent: this.id,
            template: template.calculatorTemplate,
            className: 'hide'
        });
    }

    showComponent(name) {
        this.graph2D.hide();
        this.graph3D.hide();
        this.calculator.hide();
        this[name].show();
    }
}