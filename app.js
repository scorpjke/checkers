const row_length = 8;
let square_size = $('#field').css('width').slice(0, -2) / row_length;
let checker_size = square_size*0.85;
let padding = (square_size - checker_size)/2;

let selected_checker = null;
let whites = [], blacks = [];

function create_field() {
    let r = '';
    for (let i = 0; i < row_length; i++) {
        r += '<div>';
        for (let k = 0; k < row_length; k++) {
            r += `<div id="sq${i}-${k}"></div>`;
        }
        r += '</div>';
    }
    $("#field").html(r);

    $('#field > div > div').css({ "height": square_size + "px", "width": square_size + "px" });

    $('#field > div > div').click( function() {
        if (selected_checker !== null) {
            w = this.id.toString().slice(2).split('-');
            selected_checker.pos(parseInt(w[0]),parseInt(w[1]));
            //selected_checker = null;
        }
    });
}

change_image_loc = function(i,r,c) {
    i.style.left = (square_size*c+padding)+'px';
    i.style.top = (square_size*r+padding)+'px';
}

function Checker(t,sr,sc) {
    this.team = t;
    this.row = sr;
    this.column = sc;
    this.img = this.set_image();
    this.is_damka = false;
}

Checker.prototype.set_image = function() {
    let i = document.createElement("img");
    i.width = i.height = checker_size;
    i.src = this.team+".png";
    i.addEventListener("click", () => {
        selected_checker = this;
    });

    $("#field").append(i);
    change_image_loc(i, this.row, this.column);
    return i;
}

let rules_on = false;

function get_checker_at(r,c) {
    for (let e of whites.concat(blacks)) {
        if (e.row == r && e.column == c) return e;
    }
    return null;
}

function is_occupied(r,c) {
    return get_checker_at(r,c) !== null;
}

Checker.prototype.become_damka = function() {
    this.is_damka = true;
}

Checker.prototype.destroy = function() {
    this.img.parentNode.removeChild(this.img);
    if (this.team == 'white') whites = whites.filter( e => e != this);
    if (this.team == 'black') blacks = blacks.filter( e => e != this);
}

Checker.prototype.pos = function(r, c) {
    if (rules_on) {
        let r_way = r > this.row ? 1: -1;
        let c_way = c > this.column ? 1: -1;
        let len = Math.abs(r - this.row);

        const goes_backwards = this.team == 'white' && r_way < 0 || this.team == 'black' && r_way > 0;
        if (Math.abs(r - this.row) != Math.abs(c - this.column)
        || is_occupied(r,c)
        || !this.is_damka && len > 2
        ) return;

        let checkers_on_the_way = [];
        
        for (let i = 1; i < len; i++) {
            let c = get_checker_at(this.row+i*r_way, this.column+i*c_way);
            if (c !== null) checkers_on_the_way.push(c);
        }

        if (checkers_on_the_way.length > 1) return;
        for (let e of checkers_on_the_way)
            if (e.team == this.team) return;

        if (checkers_on_the_way.length == 1) checkers_on_the_way[0].destroy();
        if (!this.is_damka && checkers_on_the_way.length == 0) {
            if (goes_backwards || len == 2) return;
        }
    }

    this.row = r;
    this.column = c;
    
    change_image_loc(this.img, r, c);

    if (this.team == 'white' && r == row_length - 1
    || this.team == 'black' && r == 0)
        this.become_damka();
}

function fill_field() {
    for (let i=0; i < row_length/2-1; i++) {
        for (let k=0; k < row_length; k=k+2) {
            whites.push(new Checker('white', i, k+i%2));
            blacks.push(new Checker('black', row_length-1-i, k+(i+1)%2));
        }
    }
}

function main() {
    create_field();
    fill_field();
    rules_on = true;
}
main();
