var express = require('express');
var app = express();
var body_parser = require('body-parser');
const PORT = process.env.PORT || 3000;
const path = require('path');
const fs = require("fs");
const { S_IFDIR } = require('constants');

var html_static = '/static/html/';


var users = [
    {id: 1, login: 'Maro', password: 'abc', age: 15, student: 'on', gender: 'M'},
    {id: 2, login: 'Anna', password: '1234', age: 17, student: 'on', gender: 'K'},
    {id: 3, login: 'Miro', password: 'kkk', age: 19, student: undefined, gender: 'M'},
];
var ids = 4;

var user_logged = false;
var user_message = '<h2 class="neutral"> Nie zalogowany </h2>'

var logout_button = '';

function applayVariables(page, vars={}){

  let path = 'static/html/' + page + '.html';

  let strTemplate = fs.readFileSync(path).toString();

  for(let vr in vars){
    let repl = '*' + vr + '*';
    strTemplate = strTemplate.replace(repl, vars[vr]);
  }
  
  return strTemplate;
}


app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.listen(PORT, function(){
    console.log("APP IS RUNNING... (" + PORT + ")");
});


app.use(express.static('static'));


app.get('/', function(req, res){
    res.send(applayVariables('index', {message: user_message, logout: logout_button}));
});


app.get('/register', function(req, res){
    res.send(applayVariables('register', {error: '', logout: logout_button}));
});

app.get('/login', function(req, res){
   res.send(applayVariables('login', {error: '', logout: logout_button}));
});


app.post('/login-user', function(req, res){

    let login = req.body.login;
    let passwd = req.body.passwd;

    let credentials = false;

    for(let i=0; i<users.length; i++){

        if(users[i].login == login && users[i].password == passwd) { credentials = true; break; }
    }

    if(credentials){
        user_logged = true;
        user_message = '<h2 class="ok"> Zalogowano </h2>';
        logout_button = '<a href="/logout"> Wyloguj </a>';
        res.send(applayVariables('index', {message: user_message, logout: logout_button}));
    }
    else{
        res.send(applayVariables('login', {error: '<p class="error"> Nieprawidłowe hasło lub login </p>', logout: logout_button}));
    }
})


app.post('/register-user', function(req, res){

    let user_exist = false;

    let data = req.body;

    for(let i=0; i<users.length; i++){

        if(users[i].login == data.login){ user_exist = true; break; }
    }

    if(!user_exist){
        users.push({
            id: ids,
            login: data.login,
            password: data.passwd,
            age: data.age,
            student: data.student_check,
            gender: data.gender
        });

        ids++;
        res.send(applayVariables('register', {error: '<p class="ok"> Dodano użytkownika </p>', logout: logout_button}));
    }
    else{
        res.send(applayVariables('register', {error: '<p class="error"> Taki użytkownik już istnieje </p>', logout: logout_button}));
    }

});

app.get('/admin', function(req, res){

    if(user_logged) res.send(applayVariables('admin', {logout: logout_button, content: ''}));
    else res.sendFile(path.join(__dirname + html_static + 'no_permission.html'));
    
})


app.get('/logout', function(req, res){
    user_logged = false;
    user_message = '<h2 class="neutral"> Nie zalogowany </h2>';
    logout_button = '';

    res.send(applayVariables('index', {message: user_message, logout: logout_button}));
})


app.get('/show', function(req, res){

    let table = '<table>';

    for(let i=0; i<users.length; i++){
        table += '<tr> <td> ID: ' + users[i].id + '</td> <td> ' + users[i].login + ' - ' + users[i].password + '</td>'; 

        if(users[i].student == 'on') table += '<td> Uczeń: <input type="checkbox" checked disabled/> </td>';
        else table += '<td> Uczeń: <input type="checkbox" disabled/> </td>';
        table += '<td> Wiek: ' + users[i].age + '</td> <td> Płeć: ' + users[i].gender + '</td> </tr>'; 
    }

    table += '</table>';

    res.send(applayVariables('admin', {logout: logout_button, content: table}));
});


app.get('/gender', function(req, res){

    let tab1 = '<table>';
    let tab2 = '<table>';

    for(let i=0; i<users.length; i++){

        if(users[i].gender == "K") tab1 += '<tr> <td> ID: ' + users[i].id + '</td> <td> Płeć: K </td> </tr>';
        else if(users[i].gender == "M") tab2 += '<tr> <td> ID: ' + users[i].id + '</td> <td> Płeć: M </td> </tr>';
    }

    tab1 += '</table>';
    tab2 += '</table>';

    let tab_content = tab1 + '</br> </br>' + tab2;

    res.send(applayVariables('admin', {logout: logout_button, content: tab_content}));

});


app.get('/sort', function(req, res){

    let sort_users = users;

    sort_users.sort(function(a, b){
        return parseInt(a.age) - parseInt(b.age);
    })

    let table = '';

    table = '<input type="radio" value="UP" name="sort" id="UP" onchange="this.form.submit()" /> <label for="UP"> Rosnąco </label>';
    table += '<input type="radio" value="DOWN" name="sort" id="DOWN" onchange="this.form.submit()" /> <label for="DOWN"> Malejąco </label></br></br>';

    table += '<table>';

    for(let i=0; i<sort_users.length; i++){

        table += '<tr> <td> ID: ' + sort_users[i].id + '</td> <td> ' + sort_users[i].login + ' - ' + sort_users[i].password;
        table += '</td> <td> Wiek: ' + sort_users[i].age + '</td> </tr>';
    }
  
    table += '</table>';

    res.send(applayVariables('admin', {logout: logout_button, content: table}));
    
});

app.post('/sort', function(req, res){

    let sortType = req.body.sort;

    let sort_users = users;

   
    let table = '';

    if(sortType == 'UP'){

        table = '<input type="radio" value="UP" name="sort" id="UP" onchange="this.form.submit()" checked="checked"/> <label for="UP"> Rosnąco </label>';
        table += '<input type="radio" value="DOWN" name="sort" id="DOWN" onchange="this.form.submit()" /> <label for="DOWN"> Malejąco </label></br></br>';
    
        table += '<table>';

        sort_users.sort(function(a, b){
            return parseInt(a.age) - parseInt(b.age);
        });

    }
    else{

        table = '<input type="radio" value="UP" name="sort" id="UP" onchange="this.form.submit()" /> <label for="UP"> Rosnąco </label>';
        table += '<input type="radio" value="DOWN" name="sort" id="DOWN" onchange="this.form.submit()" checked="checked" /> <label for="DOWN"> Malejąco </label>';
    
        table += '<table>';

        sort_users.sort(function(a, b){
            return parseInt(b.age) - parseInt(a.age);
        });

    }

    for(let i=0; i<sort_users.length; i++){

        table += '<tr> <td> ID: ' + sort_users[i].id + '</td> <td> ' + sort_users[i].login + ' - ' + sort_users[i].password;
        table += '</td> <td> Wiek: ' + sort_users[i].age + '</td> </tr>';
    }

    
    table += '</table>';

    res.send(applayVariables('admin', {logout: logout_button, content: table}));
    
});


