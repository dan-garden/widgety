registerWidget({
    id: 'photo-gallery',
    styles: {
        self: {
            width: 400,
            height: 400
        },
        'ul': {padding: 0},
        'ul li': {display: 'none'},
        'ul li:nth-child(2n)': {
            display: 'inline-block',
            width: '100%',
            height: 300,
            backgroundPosition: 'center center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
        }
    },
    state: {
        images: [
            {src: 'https://placeimg.com/640/400/any'},
            {src: 'https://placeimg.com/640/420/any'},
            {src: 'https://placeimg.com/640/440/any'},
            {src: 'https://placeimg.com/640/460/any'},
            {src: 'https://placeimg.com/640/480/any'},
            {src: 'https://placeimg.com/640/500/any'},
        ],
        current: [],
    },

    getSlide(index) {
        if(index >= this.state.images.length) {
            index = 0;
        } else if(index < 0) {
            index = this.state.images.length - 1;
        }
        return this.state.images[index];
    },

    changeSlide(dir) {
        const index = this.state.current[1].index;
        const newIndex = index + dir;
        const newSlide = this.getSlide(newIndex);
        const prevSlide = this.getSlide(newSlide.index - 1);
        const nextSlide = this.getSlide(newSlide.index + 1);
        this.setState({
            current: [prevSlide, newSlide, nextSlide]
        })
    },

    init() {
        const {images} = this.state;
        Object.keys(images).forEach(index => {
            images[index].index = parseInt(index);
        });
        this.setState({
            current: [images[images.length-1], images[0], images[1]],
            images
        });
        // this.state.interval = setInterval(() => this.changeSlide(1), 100);
    }
});

registerWidget({
    id: 'todo-list',
    disabled: true,
    styles: {'*': {display: 'none'}},
    state: {
        title: 'Todo List',
        items: []
    },

    init: function() {
        fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => response.json())
        .then(items => this.setState({items}))
    },

    addItem(newItem) {
        const items = this.state.items;

        if (newItem) {
            items.push(newItem);
            this.setState({
                items
            });
        } else {
            const input = this.select('input');
            const val = input.value.trim();
            if (val !== "") {
                items.push(input.value);
                this.setState({
                    items
                });
                input.value = "";
            }
        }
    },

    onbeforepop() {
        this.state.items.reverse();
    },

    onpop() {
        this.state.items.reverse();
    },

    removeItem(node) {
        const i = Array.prototype.indexOf.call(node.parentNode.parentNode.childNodes, node.parentNode);
        const items = this.state.items;
        items.reverse();
        items.splice(i, 1);
        items.reverse();
        this.setState({
            items
        })
    }
});

registerWidget({
    id: 'tic-tac-toe',
    styles: {'*': {display: 'none'}},
    state: {
        title: 'Tic Tac Toe',
        turn: 0,
        score: {
            0: 0,
            1: 0
        },
        tokens: ['X', 'O'],
        winner: false,
        0: ['', '', ''],
        1: ['', '', ''],
        2: ['', '', '']
    },
    checkWin() {
        let samediagl = [];
        let samediagr = [];
        for (let i = 0; i < 3; i++) {
            let samecols = [];
            let samerows = [];
            for (let j = 0; j < 3; j++) {
                samecols[j] = {
                    token: this.state[i][j],
                    x: j,
                    y: i
                };
                samerows[j] = {
                    token: this.state[j][i],
                    x: i,
                    y: j
                };
            }
            samediagl[i] = {
                token: this.state[i][i],
                x: i,
                y: i
            };
            samediagr[i] = {
                token: this.state[2 - i][i],
                x: i,
                y: 2 - i
            };
            let checkcols = samecols.every(val => val.token === this.state.tokens[this.state.turn]);
            let checkrows = samerows.every(val => val.token === this.state.tokens[this.state.turn]);
            if (checkcols || checkrows) {
                return checkcols ? samecols : samerows;
            }
        }
        let checkdiagl = samediagl.every(val => val.token === this.state.tokens[this.state.turn]);
        let checkdiagr = samediagr.every(val => val.token === this.state.tokens[this.state.turn]);
        if (checkdiagl || checkdiagr) {
            return checkdiagl ? samediagl : samediagr;
        }
        return false;
    },
    changeTurn() {
        this.setState({
            turn: this.state.turn === 0 ? 1 : 0
        });
    },
    boardFull() {
        const all = [];
        for(let i = 0; i < 3; i++) {
            this.state[i].forEach(cell => all.push(cell));
        }
        return all.every(cell => cell!== "");
    },
    resetBoard() {
        this.setState({
            winner: false,
            turn: 0,
            0: ['', '', ''],
            1: ['', '', ''],
            2: ['', '', '']
        });
    },
    gameEnd(win) {
        if(!win) {
        } else {
            this.state.score[this.state.turn]++;
            this.setState({
                winner: this.state.turn
            });
        }


        setTimeout(() => this.resetBoard(), 100);
    },
    move(x, y) {
        if (this.state[y] && this.state[y][x] === '' && this.state.winner === false) {
            this.state[y][x] = this.state.tokens[this.state.turn];
            const win = this.checkWin();
            if (!win) {
                this.changeTurn();
            } else {
                this.gameEnd(win);
            }
            return true;
        }


        if(this.boardFull()) {
            this.gameEnd(false);
            return true;
        }
        return false;
    },
    botMove(player) {
        if (this.state.turn === player) {
            const posx = Math.floor(Math.random() * 3);
            const posy = Math.floor(Math.random() * 3);
            if (!this.move(posx, posy) && this.state.winner === false) {
                return this.botMove(player);
            }
            return true;
        }
    },
    onpop() {
        this.selectAll('.cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = Array.prototype.indexOf.call(cell.parentNode.childNodes, cell);
                const y = parseInt(cell.parentNode.getAttribute('populate'));


                this.move(x, y);
                this.botMove(1);
            })
        })
    }
});