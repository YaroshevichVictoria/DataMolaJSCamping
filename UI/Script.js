function formatDate(date) {
    const newDate = new Date(date);

    let dd = newDate.getDate();
    if (dd < 10) dd = `0${dd}`;

    let mm = newDate.getMonth() + 1;
    if (mm < 10) mm = `0${mm}`;

    const yy = newDate.getFullYear();

    return `${dd}/${mm}/${yy}`;
}

function formatTime(date) {
    const newDate = new Date(date);

    let hours = newDate.getHours();
    if (hours < 10) hours = `0${hours}`;

    let min = newDate.getMinutes();
    if (min < 10) min = `0${min}`;

    return `${hours}:${min}`;
}

class Message {
    constructor(msg = { }) {
        this._id = msg.id || `${+new Date()}`;
        this.text = msg.text;
        this._createdAt = msg.createdAt ? new Date(msg.createdAt) : new Date();
        this._author = msg.author;
        this.isPersonal = msg.isPersonal ?? !!msg.to;
        this.to = msg.to;
    }

    get id() {
        return this._id;
    }

    get author() {
        return this._author;
    }

    get createdAt() {
        return this._createdAt;
    }
}

class MessageList {
    static _filterObj = {
        author: (message, author) => author && message.author.toLowerCase().includes(author.toLowerCase()),
        text: (message, text) => text && message.text.toLowerCase().includes(text.toLowerCase()),
        dateTo: (message, dateTo) => dateTo && message.createdAt < new Date(dateTo),
        dateFrom: (message, dateFrom) => dateFrom && message.createdAt > new Date(dateFrom),
        to: (message, to) => to,
    }

    static _validateObj = {
        text: (message) => message.text && message.text.length <= 200 && message.text.length > 0,
        to: (message) => message.to && message.text.length > 0,
    }

    static _validateEditObj = {
        text: (message) => message.text && message.text.length <= 200,
        to: (message) => message.to,
    }

    static validate(msg = {}) {
        return Object.keys(this._validateObj).some((key) => this._validateObj[key](msg));
    }

    static validEditMessage(msg = {}) {
        return Object.keys(this._validateEditObj).some((key) => this._validateEditObj[key](msg));
    }

    constructor(msgs = []) {
        // this.restore();
        this._arrMessages = msgs;
        this._notValidMessages = [];
    }

    set user(name) {
        this._user = name;
    }

    get user() {
        return this._user;
    }

    getPage(skip = 0, top = 10, filterConfig = {}) {
        let resultArr = this._arrMessages.slice();
        Object.keys(filterConfig).forEach((key) => {
            resultArr = resultArr.filter((message) => MessageList._filterObj[key](message, filterConfig[key]));
        });
        if (filterConfig.to) resultArr = resultArr.filter((message) => (message.author === this.user && message.to === filterConfig.to) || (message.author === filterConfig.to && message.to === this.user));
        else resultArr = resultArr.filter((message) => message.isPersonal === false);
        resultArr.sort((d1, d2) => d1.createdAt - d2.createdAt);
        resultArr.splice(0, skip);
        if (resultArr.length > top) {
            resultArr.splice(top);
        }
        return resultArr;
    }

    add(msg = {}) {
        if (this.user) {
            const message = new Message(msg);
            if (MessageList.validate(msg)) {
                this._arrMessages.push(message);
                this.save();
                return true;
            } return false;
        } return false;
    }

    get(id = '') {
        return this._arrMessages.find((message) => message.id === id);
        // return this._arrMessages.find((message) => message.id === id);
    }

    edit(idNew, msg = { text: '', to: null }) {
        if (this.user) {
            const foundMessage = this.get(idNew);
            if (MessageList.validEditMessage(msg) && foundMessage.author === this.user) {
                if (msg.text) {
                    foundMessage.text = msg.text;
                }
                if (msg.to) {
                    foundMessage.to = msg.to;
                }
                this.save();
                return true;
            } return false;
        } return false;
    }

    remove(idNew) {
        if (this.user) {
            const index = this._arrMessages.findIndex((message) => message.id === idNew && message.author === this.user);
            if (index !== -1) {
                this._arrMessages.splice(index, 1);
                this.save();
                return true;
            } return false;
        } return false;
    }

    addAll(msgs = []) {
        msgs.forEach((message) => {
            const mess = new Message(message);
            MessageList.validate(mess) ? this._arrMessages.push(mess) : this._notValidMessages.push(mess);
        });
        return this._arrMessages;
    }

    clear() {
        this._arrMessages.splice(0);
    }

    save() {
        const newArrMessages = chatController.messageList._arrMessages;
        localStorage.setItem('messages', JSON.stringify(newArrMessages));
    }
    //
    // restore() {
    //     let arr = JSON.parse(localStorage.getItem('messages'));
    //     if (localStorage.getItem('messages')) {
    //         arr = arr.map((message) => new Message(message));
    //         this._arrMessages = [...arr];
    //         if (this._arrMessages.length > 10) showMore.style.display = 'flex';
    //     }
    // }
}

class UserList {
   constructor(users = [], activeUsers = []) {
       this._users = users;
       // this.restore();
       this._activeUsers = activeUsers;
    }

    get users() {
       return this._users;
    }

    get activeUsers() {
       return this._activeUsers;
    }

    addUser(user) {
       chatController.userList.users.push(user);
       chatController.messageList.save();
       chatController.userList.save();
    }

    save() {
        const newArrUsers = chatController.userList.users;
        localStorage.setItem('users', JSON.stringify(newArrUsers));
    }

    // restore() {
    //     if (localStorage.getItem('users')) this._users = JSON.parse(localStorage.getItem('users'));
    // }
}

class HeaderView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(currentUser) {
            this.container.textContent = currentUser;
    }
}

class MessagesView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(arr) {
        this.container.innerHTML = arr.map((message) => (message.author === userNameHeader
                                    ? `<div class='my-message-container'>                              
                                            <div class='my-message-author'>${message.author}:</div>
                                            <div class='my-message-body' id="my-message">
                                                <div class='my-message-area' id="my-message-area">
                                                    <div class='my-triangle'></div>
                                                    <div class='my-message-text'>
                                                        <p><span class="textMessage">${message.text}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="message-time-date">
                                                    <div class="message-time">${formatTime(message.createdAt)}</div>
                                                    <div class="message-date">${formatDate(message.createdAt)}</div>
                                                </div>
                                                    <div class="buttons-delete-edit" id="buttons-delete-edit">
                                             <button type="button" class="button-delete">Delete</button>
                                             <button type="button" class="button-edit">Edit</button>
                                      </div>   

                                       
                                       </div>  
                                    </div>`
                                    : `<div class='message-container'>
                                        <div class='message-author'>${message.author}:</div>
                                        <div class='message-body'>
                                            <div class='message-area'>
                                                <div class='triangle'></div>
                                                <div class='message-text'>
                                                    <p><span>${message.text}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="message-time-date">
                                                <div class="message-time">${formatTime(message.createdAt)}</div>
                                                <div class="message-date">${formatDate(message.createdAt)}</div>
                                            </div>
                                        </div>
                                    </div>`)).join('');
}
}

class UsersView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(arr) {
        this.container.innerHTML = arr.map((user) => (user.isActive
                                                    ? `<div class='active-user'>
                                                            <button type="button" class=${user === userNameHeader ? 'my-button-private-messages' : 'button-private-messages'} id="button-private-messages">
                                                                <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                                                            </button>
                                                            <span id="name-private-user">${user.name}</span>
                                                        </div>`
                                                    : `<div class='user'>
                                                            <button type="button" class='button-private-messages' id="button-private-messages">
                                                                <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                                                            </button>
                                                            <span id="name-private-user">${user.name}</span>
                                                        </div>`)).join('');
    }
}

class ChatApiService {
    constructor(url) {
        this._url = url;
    }

    async _fetchRequest(url, options = {}) {
        const requestOptions = {
            method: options.method,
            headers: options.headers,
            body: options.body,
            redirect: 'follow',
        };

        try {
            return await fetch(`${this._url}/${url}`, requestOptions);
        } catch (e) {
            errorPage.style.display = 'flex';
            logo.style.display = 'none';
            buttonLogOut.style.display = 'none';
            chatController.setCurrentUser('');
            mainPage.style.display = 'none';
            errorButton.addEventListener('click', errorToHome);
        }
    }

    async _fetchLogReg(url, form) {
        const requestOptions = {
            method: 'POST',
            body: form,
            redirect: 'follow',
        };

        const response = await fetch(`${this._url}/auth/${url}`, requestOptions);
        if (!response.ok) {
            throw new Error('error');
        } else return response.text();
    }

    async register(name, pass) {
        const formdata = new FormData();
        formdata.append('name', name);
        formdata.append('pass', pass);

        return this._fetchLogReg('register', formdata);
    }

    async login(name, pass) {
        const formdata = new FormData();
        formdata.append('name', name);
        formdata.append('pass', pass);

        return this._fetchLogReg('login', formdata);
    }

    async logout() {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', chatController.token].join(''));

        return this._fetchRequest('auth/logout', { method: 'POST', headers: myHeaders });
    }

    async getUsers() {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', chatController.token].join(''));

        const response = await this._fetchRequest('users', { method: 'GET', headers: myHeaders });
        return response.text();
    }

    async getMessages(skip = 0, top = 10, filterConfig = {}, token) {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', token].join(''));

        const arr = [];
        arr.push(`skip=${skip}&top=${top}`);

        for (const el in filterConfig) {
            arr.push(`&${el}=${filterConfig[el]}`);
        }

        const response = await this._fetchRequest(`messages?${arr.join('')}`, { method: 'GET', headers: myHeaders });
        return response.text();
    }

    async deleteMessages(id = '') {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', chatController.token].join(''));

        return this._fetchRequest(`messages/${id}`, { method: 'DELETE', headers: myHeaders });
    }

    async postMessages(msg = {}) {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', chatController.token].join(''));
        myHeaders.append('Content-Type', 'application/json');

        let raw;
        msg.to ? raw = JSON.stringify({ text: msg.text, isPersonal: true, author: msg.author, to: msg.to })
               : raw = JSON.stringify({ text: msg.text, isPersonal: false, author: msg.author });

        return this._fetchRequest('messages', { method: 'POST', headers: myHeaders, body: raw });
    }

    async putMessages(id = '', msg = {}) {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', ['Bearer ', chatController.token].join(''));
        myHeaders.append('Content-Type', 'application/json');

        let raw;
        msg.to ? raw = JSON.stringify({ text: msg.text, isPersonal: true, to: msg.to })
               : raw = JSON.stringify({ text: msg.text, isPersonal: false });

        return this._fetchRequest(`messages/${id}`, { method: 'PUT', headers: myHeaders, body: raw });
    }
}

const showMore = document.getElementById('button-show-more');
const headerPrivate = document.getElementById('headerPrivateChat');
let myTop = 10;
let buttonIsHidden = false;

class ChatController {
    token;

    _size;

    constructor() {
        this.headerView = new HeaderView('userNameId');
        this.messagesView = new MessagesView('messages');
        this.usersView = new UsersView('users-list');
    }

    setCurrentUser(user = '') {
        this.headerView.display(user);
        document.getElementById('input').style.visibility = 'visible';
        document.getElementById('button-log-out').textContent = 'Log out';
    }

    async addMessage(msg = {}) {
        if (!msg.to) {
            const response = await chatApiService.postMessages({ text: msg.text, author: msg.author, isPersonal: false });
            if (response.ok) {
                await chatController.showMessages(0, 1000, { isPersonal: false }, 2000);
            }
        } else {
            const response = await chatApiService.postMessages({ text: msg.text, author: msg.author, isPersonal: true, to: msg.to });
            if (response.ok) {
                    await chatController.showMessages(0, 1000, { isPersonal: true, personalToFrom: msg.to }, 2000);
                }
        }
    }

    async editMessage(id = '', msg = {}) {
        if (!msg.to) {
            const response = await chatApiService.putMessages(id, { text: msg.text });
            if (response.ok) {
                await chatController.showMessages(0, 1000, { isPersonal: false }, 2000);
            }
        } else {
            const response = await chatApiService.putMessages({ text: msg.text, author: msg.author, isPersonal: true, to: msg.to });
            if (response.ok) {
                await chatController.showMessages(0, 1000, { isPersonal: true, personalToFrom: msg.to }, 2000);
            }
        }
    }

    async removeMessage(id = '') {
        const response = await chatApiService.deleteMessages(id);
        if (response.ok) {
            headerPrivate.style.display === 'flex'
                ? await chatController.showMessages(0, 1000, { isPersonal: true, personalToFrom: currentUserPrivate }, 2000)
                : await chatController.showMessages(0, 1000, { isPersonal: false }, 2000);
        }
    }

    async _fetchMessages(skip, top, filterConfig) {
        let response;
        headerPrivate.style.display === 'flex'
            ? response = await chatApiService.getMessages(skip, top, filterConfig, chatController.token)
            : response = await chatApiService.getMessages(skip, top, filterConfig);
        this.messagesView.display((JSON.parse(response)).reverse());
        this._size = (JSON.parse(response)).length;
    }

    async _fetchUsers() {
        const response = await chatApiService.getUsers();
        this.usersView.display(JSON.parse(response));
    }

    async showMessages(skip = 0, top = 10, filterConfig = {}, time = 70000) {
        setTimeout(() => this._fetchMessages(skip, top, filterConfig), time);

        scrollToEndPage();

        if (this._size <= 10 || !buttonIsHidden) {
            showMore.style.display = 'flex';
        } else showMore.style.display = 'none';
        if (headerPrivate.style.display === 'flex') showMore.style.display = 'none';
    }

    async showUsers(time = 70000) {
        setInterval(() => this._fetchUsers(), time);
    }

    async callBackFormLogIn() {
        event.preventDefault();
        try {
            await chatApiService.login(login.value, password.value)
                .then((result) => {
                    chatController.token = JSON.parse(result).token;
                    logInContainer.style.display = 'none';
                    buttonLogOut.style.visibility = 'visible';
                    chatController.showUsers();
                    myTop = 10;
                    chatController.setCurrentUser(login.value);
                    chatController.showMessages(0, 10, {}, 2000);
                    userNameHeader = login.value;
                });
        } catch (err) {
            if (login.value === '' || password.value === '') {
                error.textContent = 'Fill in all the fields.';
            } else {
                const response = await chatApiService.getUsers();
                const users = JSON.parse(response);
                users.find((user) => user.name === login.value) ? error.textContent = 'Wrong password.'
                    : error.textContent = 'Wrong login.';
            }
        }
    }

    async callBackFormSignUp() {
        event.preventDefault();
        const newLogin = document.getElementById('loginSignUp');
        const newPassword = document.getElementById('passwordSignUp');
        const confirmPassword = document.getElementById('confirmPassword');
        try {
            if (newPassword.value === confirmPassword.value && newPassword.value !== '') {
                await chatApiService.register(newLogin.value, newPassword.value)
                    .then(() => {
                        if (newPassword.value === confirmPassword.value && newPassword.value !== '') {
                            login.value = newLogin.value;
                            logInContainer.style.display = 'flex';
                            signUpContainer.style.display = 'none';
                            login.value = newLogin.value;
                        }
                    });
            } else {
                confirmPassword.value === ''
                    ? errorSignUp.textContent = 'Fill in all the fields.'
                    : errorSignUp.textContent = 'Passwords do not match.';
                confirmPassword.blur();
                confirmPassword.style.border = '1px solid #ef786b';
            }
        } catch (error) {
            console.log(error);
                    errorSignUp.textContent = 'Login already exists.';
            }
    }
}

const chatController = new ChatController();
const chatApiService = new ChatApiService('https://jslabdb.datamola.com');

chatController.showUsers(2000);
chatController.showMessages(0, 10, {}, 2000);

const mainPage = document.getElementById('main');
const logInContainer = document.getElementById('log-in-container');
const signUpContainer = document.getElementById('sign-up-container');
const login = document.getElementById('login');
const password = document.getElementById('password');
const formToLogin = document.getElementById('formLogIn');
const formToSignUp = document.getElementById('formSignUp');
const error = document.getElementById('errorsLog');
const errorSignUp = document.getElementById('errors');
const buttonLogOut = document.getElementById('button-log-out');
const logo = document.getElementById('logo');
const buttonSignUp = document.getElementById('buttonSignUp');
const logInOut = document.getElementById('button-log-out');
const messagesBody = document.getElementById('messages');

const namePrivateChat = document.getElementById('namePrivateChat');
const buttonReturnToChat = document.getElementById('buttonReturnToChat');

const userList = document.getElementById('users-list');

const enterMessage = document.getElementById('formTextArea');
const buttonEnterMessage = document.getElementById('submitTextArea');
const textArea = document.getElementById('text-area-enter');
const textArea2 = document.getElementById('text-area-enter2');

const filterContainer = document.getElementById('filter-container');

const errorButton = document.getElementById('errorButton');
const errorPage = document.getElementById('errorContainer');

let currentUserPrivate;
let userNameHeader;
let result;

async function foo() {
    const messages = document.querySelectorAll('.my-message-container');
    const arr = [...messages];
    let myMess;
    const eventClick = event.target;
    const container = eventClick.closest('.my-message-container');
    if (headerPrivate.style.display === 'flex') {
        const response = await chatApiService.getMessages(0, 1000, { isPersonal: true, personalToFrom: currentUserPrivate, author: userNameHeader }, chatController.token);
        const res = await response;
        myMess = [...JSON.parse(res).reverse()];
    } else {
        const response = await chatApiService.getMessages(0, 1000, { isPersonal: false, author: userNameHeader });
        const res = await response;
        myMess = [...JSON.parse(res).reverse()];
    }
    const index = arr.indexOf(container);
    return myMess[index];
}

async function callBackMessageBody() {
    const eventClick = event.target;
    if (eventClick.className === 'my-message-text') {
        const buttons = [...eventClick.closest('.my-message-body').children].find((el) => el.className === 'buttons-delete-edit');
        buttons.style.visibility = 'visible';
    }
    if (eventClick.className === 'button-edit') {
        const response = await foo();
        textArea.style.display = 'none';
        buttonEnterMessage.style.display = 'none';
        textArea2.style.display = 'block';
        textArea2.value = response.text;
        result = response.id;
    }
    if (eventClick.className === 'button-delete') {
        const container = eventClick.closest('#my-message');
        eventClick.parentNode.style.display = 'none';
        container.innerHTML += `<div class="button-confirm-delete">
                                    <input id="button-confirm-delete" onchange="confirmDeleteMessage()" type="checkbox">
                                        Delete
                                </div>`;
    }
}

function scrollToEndPage() {
    const arr = [...document.querySelectorAll('.message-container')];
    if (arr.length > 0) {
        const endPage = arr;
        const size = endPage.length;
        endPage[size - 1].scrollIntoView();
    }
}

async function formFilter() {
    event.preventDefault();
    const userName = document.getElementById('filter-name');
    const textMessage = document.getElementById('filter-text');
    const dateMessage = document.getElementById('filter-date');

    const filters = { author: userName.value, text: textMessage.value, dateFrom: dateMessage.value };
    if (headerPrivate.style.display === 'flex') {
        filters.isPersonal = true;
        filters.personalToFrom = currentUserPrivate;
    } else {
        filters.isPersonal = false;
    }
    await chatController.showMessages(0, 100, filters, 2000);

    showMore.style.display = 'none';
        if (chatController._size === 0) {
            chatController.messagesView.container.innerHTML = '<p class="nothing-to-found">Nothing to found.</p>';
        }
    userName.value = '';
    textMessage.value = '';
    dateMessage.value = '';
}

async function callBackPrivateMessages() {
    const eventClick = event.target;
    if (eventClick.tagName === 'svg' || eventClick.tagName === 'path') {
        currentUserPrivate = eventClick.closest('.active-user').lastElementChild.textContent;
        showMore.style.display = 'none';
        headerPrivate.style.display = 'flex';
        namePrivateChat.textContent = currentUserPrivate;
        await chatController.showMessages(0, 1000, { isPersonal: true, personalToFrom: currentUserPrivate });
    }
}

function callBackEditMess() {
    if (event.which === 13 && !event.shiftKey) {
        showMore.style.display = 'none';
        textArea2.style.display = 'none';
        textArea.style.display = 'block';
        buttonEnterMessage.style.display = 'block';
        headerPrivate.style.display === 'none'
        ? chatController.editMessage(result, { text: textArea2.value })
            : chatController.editMessage(result, { text: textArea2.value, to: currentUserPrivate });
    }
}

async function callBackShowMore() {
    buttonIsHidden = false;
    const res = await chatApiService.getMessages(0, 1000);
    if (JSON.parse(res).length > 0) {
        myTop += 10;
        chatController.showMessages(0, myTop, {}, 1000);

        if (JSON.parse(res).length - myTop <= 0) {
            showMore.style.display = 'none';
            myTop = 10;
            buttonIsHidden = true;
        }
    }
}

function returnToChat() {
    headerPrivate.style.display = 'none';
    chatController.showMessages();
}

function addMessages() {
    event.preventDefault();
    if (event.which === 13 && !event.shiftKey) {
        addMessagesButton();
    }
}

function addMessagesButton() {
    event.preventDefault();
    headerPrivate.style.display === 'flex'
        ? chatController.addMessage({ text: textArea.value, author: userNameHeader, to: currentUserPrivate })
        : chatController.addMessage({ text: textArea.value, author: userNameHeader });
    textArea.value = '';
    showMore.style.display = 'none';
}

async function confirmDeleteMessage() {
    const response = await foo();
    await chatController.removeMessage(response.id);
}

function clickButtonSignUp() {
    logInContainer.style.display = 'none';
    signUpContainer.style.display = 'flex';
    buttonLogOut.style.visibility = 'hidden';
}

function toMainPage() {
    logInContainer.style.display = 'none';
    signUpContainer.style.display = 'none';
    buttonLogOut.style.visibility = 'visible';
}

async function buttonLogOutIn() {
    if (logInOut.textContent === 'Log out') {
        event.preventDefault();
        const response = await chatApiService.logout();
        if (response.ok) {
            chatController.setCurrentUser('');
            document.getElementById('userNameId').innerText = '';
            logInOut.textContent = 'Log in';
            chatController.showMessages();
            document.getElementById('input').style.visibility = 'hidden';
            headerPrivate.style.display = 'none';
        }
    } else {
        event.preventDefault();
        logInContainer.style.display = 'flex';
    }
}

function errorToHome() {
    errorPage.style.display = 'none';
    logo.style.display = 'flex';
    buttonLogOut.style.display = 'block';
    mainPage.style.display = 'flex';
    showMore.style.display = 'flex';
    document.getElementById('input').style.visibility = 'hidden';
    logInOut.textContent = 'Log in';
}

textArea.addEventListener('keyup', addMessages);

enterMessage.addEventListener('submit', addMessagesButton);

textArea2.addEventListener('keyup', callBackEditMess);

userList.addEventListener('click', callBackPrivateMessages);

buttonReturnToChat.addEventListener('click', returnToChat);

formToLogin.addEventListener('submit', chatController.callBackFormLogIn);

formToSignUp.addEventListener('submit', chatController.callBackFormSignUp);

filterContainer.addEventListener('submit', formFilter);

buttonSignUp.addEventListener('click', clickButtonSignUp);

logInOut.addEventListener('click', buttonLogOutIn);

showMore.addEventListener('click', callBackShowMore);

messagesBody.addEventListener('click', callBackMessageBody);
