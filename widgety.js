const widgets = [];



class Widget {
    constructor(obj) {
        this.disabled = obj.disabled ? true : false;
        const dels = ['state', 'class', 'id'];
        this.id = obj.id ? obj.id : false;
        this.class = obj.class && !this.id ? obj.class : false;
        this.state = obj.state ? obj.state : {};

        Object.keys(obj).forEach(key => {
            if (dels.indexOf(key) < 0) {
                this[key] = obj[key];
            }
        })
    }

    loaded() {
        this.dom = this.id ? document.querySelectorAll('#' + this.id) : (this.class ? document.querySelectorAll('.' + this.class) : false);
        this.dom.forEach(node => node.setAttribute('widget-ref', this.id || this.class));
        if(this.init && !this.disabled) {
            this.init();
        }
        this.populate(true);
    }

    selectAll(query) {
        const nodes = [];
        this.dom.forEach(node => {
            node.querySelectorAll(query).forEach(childnode => nodes.push(childnode));
        })
        return nodes;
    }

    select(query) {
        return this.selectAll(query)[0];
    }

    stringToDom(str) {
        let temp = document.createElement('div');
        temp.innerHTML = str;
        temp = temp.firstChild;
        return temp;
    }

    setState(obj) {
        Object.keys(obj).forEach(key => {
            this.state[key] = obj[key];
        });

        return this.populate();
        // const newState = JSON.parse(JSON.stringify(this.state));
        // Object.keys(obj).forEach(key => {
        //     newState[key] = obj[key];
        // });

        // if (JSON.stringify(newState) === JSON.stringify(this.state)) {
        //     console.log('same same');
        //     return this;
        // } else {
        //     console.log('but different');
        //     this.state = newState;
        //     return this.populate();
        // }
    }

    applyStyles(styles) {
        if(styles.self) {
            this.dom.forEach(node => {
                Object.keys(styles.self).forEach(property => {
                    let val = styles.self[property];
                    node.style[property] = isNaN(val) ? val : val+'px';
                });
            });
            // delete styles.self;
        }
        Object.keys(styles).forEach(selector => {
            const properties = Object.keys(styles[selector]);
            this.selectAll(selector).forEach(node => properties.forEach(property => {
                let val = styles[selector][property];
                node.style[property] = isNaN(val) ? val : val+'px';
            }))
        })
    }

    populate(events=true) {
        const populus = this.selectAll('*[populate]');
        if (this.onbeforepop && events) {
            this.onbeforepop();
        }
        populus.forEach(node => {
            let popwith = this.state[node.getAttribute('populate')];
            let format = node.getAttribute('format');
            if (popwith instanceof Array) {
                node.innerHTML = '';
                popwith.forEach((val, i) => {
                    if(format) {
                        let formatstring = format;
                        Object.keys(val).forEach(key => {
                            formatstring = formatstring.split('$'+key).join(val[key].toString());
                        })
                        val = formatstring;
                    }
                    let popin = this.stringToDom(node.getAttribute('in'));
                    let popwithit = this.stringToDom(node.getAttribute('with'));
                    if(popin) {
                        popin.innerHTML = val;
                        if (popwithit) {
                            popin.prepend(popwithit);
                        }
                        node.append(popin);
                    } else {
                        node.append(this.stringToDom(val));
                    }
                    
                });
            } else if (typeof popwith === 'object' && !(popwith instanceof Array)) {
                if(format) {
                    Object.keys(popwith).forEach(key => {
                        format = format.split('$'+key).join(popwith[key]);
                    })
                    node.innerHTML = format;
                }
            } else if (typeof popwith === 'string' || typeof popwith === 'boolean' || typeof popwith === 'number') {
                node.innerText = popwith;
            }
        })

        this.applyStyles(this.styles || {});
        if (this.onpop && events) {
            this.onpop();
        }

        return this;
    }
}


function registerWidget(obj) {
    if (!(obj instanceof Widget)) {
        obj = new Widget(obj);
    }


    widgets.push(obj);
}



function widget(node) {
    if (
        typeof Node === "object" ? node instanceof Node :
        node && typeof node === "object" && typeof node.nodeType === "number" && typeof node.nodeName === "string"
    ) {
        if(event) {
            event.preventDefault();
        }
        const check = node.parentNode.getAttribute('widget-ref');
        if (check) {
            return widgets.find(w => w.id === check || w.class === check) ? widgets.find(w => w.id === check || w.class === check) : false;
        } else {
            return widget(node.parentNode);
        }
    } else {
        return widgets.find(w => w.id === node || w.class === node);
    }
}


document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        Object.keys(widgets).forEach(widgetKey => widgets[widgetKey].loaded());
    }
}