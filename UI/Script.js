function formatDate(date = '') {
    let dd = date.getDate();
    if (dd < 10) dd = `0${dd}`;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = `0${mm}`;

    const yy = date.getFullYear();

    return `${dd}/${mm}/${yy}`;
}

function formatTime(date = '') {
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
        this._createdAt = msg.createdAt ? new Date(msg.createdAt) : new Date();
        this._author = msg.author || messageList.user;
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
        text: (message, text) => text && message.text.toLowerCase().includes(text.toLowerCase),
        dateTo: (message, dateTo) => dateTo && message.createdAt < new Date(dateTo),
        dateFrom: (message, dateFrom) => dateFrom && message.createdAt > new Date(dateFrom),
    }

    static _validateObj = {
        text: (message) => message.text && message.text.length <= 200,
    }

    static _validateEditObj = {
        text: (message) => message.text && message.text.length <= 200,
        to: (message) => message.to && message.to !== '',
    }

    static validate(msg = {}) {
        return Object.keys(this._validateObj).every((key) => this._validateObj[key](msg));
    }

    static validEditMessage(msg = {}) {
        return Object.keys(this._validateEditObj).some((key) => this._validateEditObj[key](msg));
    }

    constructor(msgs = []) {
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
        resultArr = resultArr.filter((message) => message.author === this.user || message.isPersonal === false || message.to === this.user);
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
                } return true;
            } return false;
        } return false;
    }

    remove(idNew) {
        if (this.user) {
            const index = this._arrMessages.findIndex((message) => message.id === idNew && message.author === this.user);
            if (index !== -1) {
                this._arrMessages.splice(index, 1);
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
}

class UserList {
   constructor(users = [], activeUsers = []) {
        this._users = users;
        this.activeUsers = activeUsers;
    }

    get users() {
       return this._users;
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
        this.container.innerHTML = arr.map((message) => (message._author === messageList.user
                                    ? `<div class='my-message-container'>
                                        <div class='my-message-author'>${message._author}:</div>
                                        <div class='my-message-body'>
                                            <div class='my-message-area'>
                                                <div class='my-triangle'></div>
                                                <div class='my-message-text'>
                                                    <p><span>${message.text}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="message-time-date">
                                                <div class="message-time">${formatTime(message._createdAt)}</div>
                                                <div class="message-date">${formatDate(message._createdAt)}</div>
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
        this.container.innerHTML = arr.map((user) => `<div class=${userList.activeUsers.includes(user) ? 'active-user' : 'user'}>
                    <button type="button" class="button-private-messages">
                        <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                    </button>
                    <span>${user}</span>
                </div>`).join('');
    }
}

function setCurrentUser(user = '') {
    headerView.display(user);
    messageList.user = user;
    if (messageList.user) {
        document.getElementById('input').innerHTML = '<textarea id="text-area-enter" cols="102" rows="3" placeholder="  Press Enter to send the message."/>';
        document.getElementById('button-log-out').textContent = 'Log out';
    }
}

function addMessage({ text = '', isPersonal = false, to = null }) {
     if (!to) {
         if (messageList.add({ text, isPersonal })) messagesView.display(messageList.getPage());
     }
}

function editMessage(id = `+${new Date()}`, { text = '', to = '' }) {
    if (messageList.edit(id, { text, to }))messagesView.display(messageList.getPage());
}

function removeMessage(id = '') {
    if (messageList.remove(id))messagesView.display(messageList.getPage());
}

function showMessages(skip = 0, top = 10, filterConfig = {}) {
    const arr = messageList.getPage(skip, top, filterConfig);
    messagesView.display(arr);
}

function showUsers() {
    usersView.display(userList.users);
}

const message1 = new Message({ id: 6, text: 'Lorem ipsum', createdAt: '2020-10-09T13:05:00', author: 'Yanina Chirko' });
const message3 = new Message({ id: 15, text: 'ipsum', createdAt: '2020-10-13T19:05:00', author: 'Polina Skoraya' });
const message2 = new Message({ text: 'dolor sit amet', author: 'Victoria Yaroshevich' });
const message4 = new Message({ id: 8, text: 'Cras dapibus', createdAt: '2020-10-13T13:05:00', author: 'Alexey Yaroshevich' });
const message5 = new Message({ text: 'Curabitur ullamcorper ultricies', createdAt: '2020-10-13T13:05:00', author: 'Anastasia Ostashenko' });
const message6 = new Message({ id: 10, text: 'Vivamus elementum semper nisi', author: 'Victoria Yaroshevich' });

const messageList = new MessageList([message1, message2, message3, message4, message5, message6]);
const userList = new UserList(['Yanina Chirko', 'Polina Skoraya', 'Alexey Yaroshevich', 'Victoria Yaroshevich', 'Alexander Averin', 'Anastasia Ostashenko'],
    ['Victoria Yaroshevich', 'Yanina Chirko', 'Alexander Averin', 'Anastasia Ostashenko']);
const headerView = new HeaderView('userNameId');
const messagesView = new MessagesView('messages');
const usersView = new UsersView('users-list');

setCurrentUser('Victoria Yaroshevich');

addMessage({ text: 'Vivamus elemlkmlmentum' });

editMessage(10, { text: 'hahahahaha' });

removeMessage(10);

showMessages(0, 10, { dateFrom: '2020-10-09T11:00:00', dateTo: '2020-10-13T13:06:00' });

showUsers();
