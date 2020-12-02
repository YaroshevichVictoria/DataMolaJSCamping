function formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = `0${dd}`;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = `0${mm}`;

    const yy = date.getFullYear();

    return `${dd}/${mm}/${yy}`;
}

function formatTime(date) {
    const newDate = new Date(date);

    let hours = date.getHours();
    if (hours < 10) hours = `0${hours}`;

    let min = date.getMinutes() + 1;
    if (min < 10) min = `0${min}`;

    return `${hours}:${min}`;
}
class Message {
    constructor(msg = { }) {
        this._id = msg.id || `${+new Date()}`;
        this.text = msg.text;
        this._createdAt = msg.createdAt ? new Date(msg._createdAt) : new Date();
        this._author = msg._author || chatController.messageList.user;
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
        this.restore();
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
        return this._notValidMessages;
    }

    clear() {
        this._arrMessages.splice(0);
    }

    save() {
        const newArrMessages = chatController.messageList._arrMessages;
        localStorage.setItem('messages', JSON.stringify(newArrMessages));
    }

    restore() {
        let arr = JSON.parse(localStorage.getItem('messages'));
        if (localStorage.getItem('messages')) {
            arr = arr.map((message) => new Message(message));
            this._arrMessages = [...arr];
            if (this._arrMessages.length > 10) showMore.style.display = 'flex';
        }
    }
}

class UserList {
   constructor(users = [], activeUsers = []) {
       this.restore();
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

    restore() {
        if (localStorage.getItem('users')) this._users = JSON.parse(localStorage.getItem('users'));
    }
}
class HeaderView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(currentUser) {
        if (currentUser) {
            this.container.textContent = currentUser;
        }
    }
}

class MessagesView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(arr) {
        this.container.innerHTML = arr.map((message) => (message._author === chatController.messageList.user
                                    ? `<div class='my-message-container'>                              
                                            <div class='my-message-author'>${message._author}:</div>
                                            <div class='my-message-body' id="my-message">
                                                <div class='my-message-area' id="my-message-area">
                                                    <div class='my-triangle'></div>
                                                    <div class='my-message-text'>
                                                        <p><span class="textMessage">${message.text}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="message-time-date">
                                                    <div class="message-time">${formatTime(message._createdAt)}</div>
                                                    <div class="message-date">${formatDate(message._createdAt)}</div>
                                                </div>
                                                    <div class="buttons-delete-edit" id="buttons-delete-edit">
                                             <button type="button" class="button-delete">Delete</button>
                                             <button type="button" class="button-edit">Edit</button>
                                      </div>   

                                       
                                       </div>  
                                    </div>`
                                    : `<div class='message-container'>
                                        <div class='message-author'>${message._author}:</div>
                                        <div class='message-body'>
                                            <div class='message-area'>
                                                <div class='triangle'></div>
                                                <div class='message-text'>
                                                    <p><span>${message.text}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="message-time-date">
                                                <div class="message-time">${formatTime(message._createdAt)}</div>
                                                <div class="message-date">${formatDate(message._createdAt)}</div>
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
        this.container.innerHTML = arr.map((user) => (chatController.userList.activeUsers.includes(user)
                                                    ? `<div class='active-user'>
                                                            <button type="button" class=${user === chatController.messageList.user ? 'my-button-private-messages' : 'button-private-messages'} id="button-private-messages">
                                                                <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                                                            </button>
                                                            <span id="name-private-user">${user}</span>
                                                        </div>`
                                                    : `<div class='user'>
                                                            <button type="button" class='button-private-messages' id="button-private-messages">
                                                                <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                                                            </button>
                                                            <span id="name-private-user">${user}</span>
                                                        </div>`)).join('');
    }
}

class ChatController {
    constructor() {
        this.messageList = new MessageList();
        this.userList = new UserList([], ['Yanina']);// добавила активного просто для наглядности, чтобы проверить, как работает приватный чат
        this.headerView = new HeaderView('userNameId');
        this.messagesView = new MessagesView('messages');
        this.usersView = new UsersView('users-list');
    }

    setCurrentUser(user = '') {
        this.headerView.display(user);
        this.messageList.user = user;
        document.getElementById('input').style.visibility = 'visible';
        document.getElementById('button-log-out').textContent = 'Log out';
    }

    addMessage({ text, isPersonal = false, to = null }) {
        if (!to && text.length > 1) {
            if (this.messageList.add({ text, isPersonal })) this.messagesView.display(this.messageList.getPage());
        }
        if (to && text.length > 1) {
            this.messageList.add({ text, isPersonal, to });
            this.messagesView.display(this.messageList.getPage(0, this.messageList._arrMessages.length, { to }));
        }
    }

    editMessage(id = `+${new Date()}`, { text = '', to = null }) {
        if (this.messageList.edit(id, { text, to })) this.messagesView.display(this.messageList.getPage(0, this.messageList._arrMessages.length, { to }));
    }

    removeMessage(id = '') {
        if (this.messageList.remove(id)) {
            headerPrivate.style.display === 'flex'
                ? this.messagesView.display(this.messageList.getPage(0, this.messageList._arrMessages.length, { to: namePrivateChat.textContent }))
                : this.messagesView.display(this.messageList.getPage(0, this.messageList._arrMessages.length));
        }
    }

    showMessages(skip = 0, top = 10, filterConfig = {}) {
        const arr = this.messageList.getPage(skip, top, filterConfig);
        if (headerPrivate.style.display === 'none') {
            if (this.messageList.getPage(0, this.messageList._arrMessages.length).length > 10) {
                showMore.style.display = 'flex';
            } else showMore.style.display = 'none';
        }
        this.messagesView.display(arr);
    }

    showUsers() {
        this.usersView.display(this.userList.users);
        this.messageList.save();
        this.userList.save();
    }

    callBackFormLogIn() {
        event.preventDefault();
        const users = JSON.parse(localStorage.getItem('user'));
        const foundUser = users.find((user) => user.loginSignUp === login.value);
        if (foundUser) {
            if (foundUser.passwordSignUp === password.value) {
                logInContainer.style.display = 'none';
                buttonLogOut.style.visibility = 'visible';
                chatController.userList.activeUsers.push(login.value);
                chatController.setCurrentUser(login.value);
                chatController.showUsers();
                chatController.showMessages();
            }
            if (password.value !== foundUser.passwordSignUp) {
                error.textContent = 'Wrong password.';
                password.style.border = '1px solid #ef786b';
            }
            if (password.value === '') {
                error.textContent = 'Fill in all the fields.';
                password.style.border = '1px solid #ef786b';
            }
        } else {
            error.textContent = 'Login not registered.';
            login.style.border = '1px solid #ef786b';
        }
    }

    callBackFormSignUp() {
        event.preventDefault();
        const newLogin = document.getElementById('loginSignUp');
        const newPassword = document.getElementById('passwordSignUp');
        const confirmPassword = document.getElementById('confirmPassword');
        const users = JSON.parse(localStorage.getItem('user'));
        let signUpArr = [];
        if (localStorage.getItem('user')) {
             signUpArr = [...users];
        }

        let signUpObj = {};
        signUpObj = {
            loginSignUp: newLogin.value,
            passwordSignUp: newPassword.value,
        };

        signUpArr.push(signUpObj);

        if (newPassword.value === confirmPassword.value && newPassword.value !== '') {
            localStorage.setItem('user', JSON.stringify(signUpArr));
            chatController.userList.addUser(newLogin.value);
            chatController.showUsers();
            login.value = newLogin.value;
            logInContainer.style.display = 'flex';
            signUpContainer.style.display = 'none';
            login.value = newLogin.value;
        }
        if (newPassword.value === '' || confirmPassword.value === '' || newLogin.value === '') {
            errorSignUp.textContent = 'Fill in all the fields.';
        } else {
            errorSignUp.textContent = 'Passwords do not match.';
            confirmPassword.blur();
            confirmPassword.style.border = '1px solid #ef786b';
        }
    }
}

const logInContainer = document.getElementById('log-in-container');
const signUpContainer = document.getElementById('sign-up-container');
const login = document.getElementById('login');
const password = document.getElementById('password');
const formToLogin = document.getElementById('formLogIn');
const formToSignUp = document.getElementById('formSignUp');
const error = document.getElementById('errorsLog');
const errorSignUp = document.getElementById('errors');
const buttonLogOut = document.getElementById('button-log-out');
const buttonSignUp = document.getElementById('buttonSignUp');
const logInOut = document.getElementById('button-log-out');
const messagesBody = document.getElementById('messages');

const headerPrivate = document.getElementById('headerPrivateChat');
const namePrivateChat = document.getElementById('namePrivateChat');
const buttonReturnToChat = document.getElementById('buttonReturnToChat');

const userList = document.getElementById('users-list');

const textArea = document.getElementById('text-area-enter');
const textArea2 = document.getElementById('text-area-enter2');
const textArea3 = document.getElementById('text-area-enter3');

const showMore = document.getElementById('button-show-more');

const filterContainer = document.getElementById('filter-container');

let result;
let myTop = 10;

isEmptyLocalStorage();
const chatController = new ChatController();

chatController.showUsers();
chatController.showMessages();

function isEmptyLocalStorage() { // ???????????????????????
    if (!localStorage.getItem('messages') && !localStorage.getItem('users')) {
        const message4 = new Message({ id: 8, text: 'Cras dapibus', createdAt: '2020-10-13T13:05:00', author: 'Victoria' });
        const message5 = new Message({ text: 'Curabitur ullamcorper ultricies', createdAt: '2020-10-13T13:05:00', author: 'Yanina' });
        const arr = [message4, message5];
        localStorage.setItem('messages', JSON.stringify(arr));
        localStorage.setItem('users', JSON.stringify(['Victoria', 'Yanina', 'Alex']));
        localStorage.setItem('user', JSON.stringify([{ loginSignUp: 'Victoria', passwordSignUp: 'qwe' }, { loginSignUp: 'Yanina', passwordSignUp: 'qwe' }, { loginSignUp: 'Alex', passwordSignUp: 'qwe' }]));
    }
}
function foo() {
    const messages = document.querySelectorAll('.my-message-container');
    const arr = [...messages];
    let myMess;
    const eventClick = event.target;
    const container = eventClick.closest('.my-message-container');
    if (headerPrivate.style.display === 'flex') {
         myMess = chatController.messageList.getPage(0, chatController.messageList._arrMessages.length, {
            author: chatController.messageList.user,
            to: namePrivateChat.textContent,
        });
    } else {
        myMess = chatController.messageList.getPage(0, chatController.messageList._arrMessages.length, {
        author: chatController.messageList.user });
    }
    const index = arr.indexOf(container);
    return myMess[index].id;
}

function callBackMessageBody() {
    const eventClick = event.target;
    if (eventClick.className === 'my-message-text') {
        const buttons = [...eventClick.closest('.my-message-body').children].find((el) => el.className === 'buttons-delete-edit');
        buttons.style.visibility = 'visible';
    }
    if (eventClick.className === 'button-edit') {
        const message = chatController.messageList.get(foo());
        textArea.style.display = 'none';
        textArea3.style.display = 'none';
        textArea2.style.display = 'block';
        textArea2.value = message.text;
        result = message.id;
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
    const endPage = [...document.querySelectorAll('.message-container'), ...document.querySelectorAll('.my-message-container')];
    const size = endPage.length;
    endPage[size - 1].scrollIntoView();
}

function checkedFilterValue(arr = []) {
    const obj = {
        author: arr[0],
        text: arr[1],
        dateFrom: arr[2],
    };
    for (const key in obj) {
        if (!obj[key]) {
            delete obj[key];
        }
    }
    if (headerPrivate.style.display === 'flex') obj.to = namePrivateChat.textContent;
    return obj;
}

function formFilter() {
    event.preventDefault();
    const userName = document.getElementById('filter-name');
    const textMessage = document.getElementById('filter-text');
    const dateMessage = document.getElementById('filter-date');
    const filters = checkedFilterValue([userName.value, textMessage.value, dateMessage.value]);
    chatController.showMessages(0, chatController.messageList._arrMessages.length, filters);
    showMore.style.display = 'none';
    if (!chatController.messagesView.container.innerHTML) {
        chatController.messagesView.container.innerHTML = '<p class="nothing-to-found">Nothing to found.</p>';
    }
    userName.value = '';
    textMessage.value = '';
    dateMessage.value = '';
}

function callBackPrivateMessages() {
    const eventClick = event.target;
    if (chatController.messageList.user && (eventClick.tagName === 'svg' || eventClick.tagName === 'path')) {
        const activeUser = eventClick.closest('.active-user').lastElementChild.textContent;
        chatController.showMessages(0, chatController.messageList._arrMessages.length, { to: activeUser });
        showMore.style.display = 'none';
        headerPrivate.style.display = 'flex';
        namePrivateChat.textContent = activeUser;
        textArea3.style.display = 'flex';
        textArea.style.display = 'none';
    }
}

function callBackEditMess() {
    if (event.which === 13 && !event.shiftKey) {
        chatController.editMessage(result, { text: textArea2.value });
        headerPrivate.style.display === 'flex'
            ? chatController.showMessages(0, chatController.messageList._arrMessages.length, { to: namePrivateChat.textContent })
            : chatController.showMessages(0, chatController.messageList._arrMessages.length);
        scrollToEndPage();
        showMore.style.display = 'none';
        textArea2.style.display = 'none';
        textArea.style.display = 'block';
    }
}

function callBackShowMore() {
    if (chatController.messageList._arrMessages.length > 0) {
        myTop += 10;
        chatController.showMessages(0, myTop);
        scrollToEndPage();
        if (chatController.messageList._arrMessages.length - myTop < 0) {
            showMore.style.display = 'none';
        }
    }
}

function addPrivateMessages() {
    if (event.which === 13 && !event.shiftKey) {
        chatController.addMessage({ text: textArea3.value, isPersonal: true, to: namePrivateChat.textContent });
        textArea3.value = '';
        scrollToEndPage();
    }
}
function returnToChat() {
    headerPrivate.style.display = 'none';
    textArea3.style.display = 'none';
    textArea.style.display = 'flex';
    chatController.showMessages();
    scrollToEndPage();
}

function addMessages() {
    if (event.which === 13 && !event.shiftKey) {
        chatController.addMessage({ text: textArea.value });
        textArea.value = '';
        chatController.showMessages(0, chatController.messageList._arrMessages.length);
        showMore.style.display = 'none';
        scrollToEndPage();
    }
}

function confirmDeleteMessage() {
        chatController.removeMessage(foo());
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

function buttonLogOutIn() {
    if (logInOut.textContent === 'Log out') {
        event.preventDefault();
        const index = chatController.userList.activeUsers.indexOf(chatController.messageList.user);
        chatController.userList.activeUsers.splice(index, 1);
        chatController.setCurrentUser('');
        document.getElementById('userNameId').innerText = '';
        logInOut.textContent = 'Log in';
        chatController.showMessages();
        chatController.showUsers();
        document.getElementById('input').style.visibility = 'hidden';
        headerPrivate.style.display = 'none';
    } else {
        event.preventDefault();
        logInContainer.style.display = 'flex';
    }
}

textArea.addEventListener('keyup', addMessages);

textArea2.addEventListener('keyup', callBackEditMess);

userList.addEventListener('click', callBackPrivateMessages);

textArea3.addEventListener('keyup', addPrivateMessages);

buttonReturnToChat.addEventListener('click', returnToChat);

formToLogin.addEventListener('submit', chatController.callBackFormLogIn);

formToSignUp.addEventListener('submit', chatController.callBackFormSignUp);

filterContainer.addEventListener('submit', formFilter);

buttonSignUp.addEventListener('click', clickButtonSignUp);

logInOut.addEventListener('click', buttonLogOutIn);

showMore.addEventListener('click', callBackShowMore);

messagesBody.addEventListener('click', callBackMessageBody);
