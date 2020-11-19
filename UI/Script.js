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
    constructor(msg = {}) {
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
        text: (message, text) => text && message.text.toLowerCase().includes(text.toLowerCase),
        dateTo: (message, dateTo) => dateTo && message.createdAt < new Date(dateTo),
        dateFrom: (message, dateFrom) => dateFrom && message.createdAt > new Date(dateFrom),
    }

    static _validateObj = {
        id: (message) => message.id,
        text: (message) => message.text && message.text.length <= 200,
        author: (message) => message.author && message.author.length > 0,
        createdAt: (message) => message.createdAt,
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
        MessageList._arrMessages = msgs;
        this._notValidMessages = [];
    }

    set user(name) {
        this._user = name;
    }

    get user() {
        return this._user;
    }

    getPage(skip = 0, top = 10, filterConfig = {}) {
        let resultArr = MessageList._arrMessages.slice();
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
                MessageList._arrMessages.push(message);
                return true;
            } return false;
        } return false;
    }

    get(id = '') {
        return MessageList._arrMessages.find((message) => message.id === id);
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
            const index = MessageList._arrMessages.findIndex((message) => message.id === idNew && message.author === this.user);
            if (index !== -1) {
                MessageList._arrMessages.splice(index, 1);
                return true;
            } return false;
        } return false;
    }

    addAll(msgs = []) {
        msgs.forEach((message) => {
            const mess = new Message(message);
            MessageList.validate(mess) ? MessageList._arrMessages.push(mess) : this._notValidMessages.push(mess);
        });
        return this._notValidMessages;
    }

    clear() {
        MessageList._arrMessages.splice(0);
    }
}

class UserList {
   constructor(users = [], activeUsers = []) {
        UserList.users = users;
        UserList.activeUsers = activeUsers;
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

    display(arr = MessageList._arrMessages) {
        this.container.innerHTML = arr.map((message) => `<div class=${message._author === MessageList.prototype.user
        ? 'my-message-container' : 'message-container'}>
                                        <div class=${message._author === MessageList.prototype.user
            ? 'my-message-author' : 'message-author'}>${message._author}:</div>
                                        <div class=${message._author === MessageList.prototype.user
            ? 'my-message-body' : 'message-body'}>
                                            <div class=${message._author === MessageList.prototype.user
            ? 'my-message-area' : 'message-area'}>
                                                <div class=${message._author === MessageList.prototype.user
            ? 'my-triangle' : 'triangle'}></div>
                                                <div class=${message._author === MessageList.prototype.user
            ? 'my-message-text' : 'message-text'}>
                                                    <p><span>${message.text}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="message-time-date">
                                                <div class="message-time">${formatTime(message._createdAt)}</div>
                                                <div class="message-date">${formatDate(message._createdAt)}</div>
                                            </div>
                                        </div>
                                    </div>`).join('');
}
}

class UsersView {
    constructor(containerId = '') {
        this.container = document.getElementById(containerId);
    }

    display(arr = []) {
        this.container.innerHTML = arr.map((user) => `<div class=${UserList.activeUsers.includes(user) ? 'active-user' : 'user'}>
                    <button type="button" class="button-private-messages">
                        <span class="iconify" data-icon="eva:paper-plane-fill" data-inline="false"/>
                    </button>
                    <span>${user}</span>
                </div>`).join('');
    }
}

// class FilterView не нужен,т.к. фильтры отобр на стр всегда

function setCurrentUser(user = '') {
    new HeaderView('userNameId').display(user);
    MessageList.prototype.user = user;
    if (MessageList.prototype.user) {
        document.getElementById('input').innerHTML = '<textarea id="text-area-enter" cols="102" rows="3" placeholder="  Press Enter to send the message."/>';
        document.getElementById('button-log-out').textContent = 'Log out';
    }
}

function addMessage({ text = '', isPersonal = false, to = null }) {
     const id = `+${new Date()}`;
     const createdAt = new Date();
     const author = MessageList.prototype.user;
     if (!to) { // личные сообщения отображаются в личных диалогах, а не на гл стр
         console.log(MessageList.prototype.add({ id, text, createdAt, author, isPersonal }));
         new MessagesView('messages').display();
     }
}

function editMessage(id = `+${new Date()}`, { text = '', to = '' }) {
    MessageList.prototype.edit(id, { text, to });
    new MessagesView('messages').display();
}

function removeMessage(id = '') {
    MessageList.prototype.remove(id);
    new MessagesView('messages').display();
}

function showMessages(skip = 0, top = 10, filterConfig = {}) {
    const arr = MessageList.prototype.getPage(skip, top, filterConfig);
    new MessagesView('messages').display(arr);
}

function showUsers() {
    const arr = UserList.activeUsers.concat(UserList.users);
    const usersArr = Array.from(new Set(arr));
    new UsersView('users-list').display(usersArr);
}

const message1 = new Message({ id: 6, text: 'Lorem ipsum', createdAt: '2020-10-09T13:05:00', author: 'Yanina Chirko' });
const message3 = new Message({ id: 15, text: 'ipsum', createdAt: '2020-10-13T19:05:00', author: 'Polina Skoraya' });
const message2 = new Message({ text: 'dolor sit amet', author: 'Victoria Yaroshevich' });
const message4 = new Message({ id: 7, text: 'porttitor eu', createdAt: '2020-10-13T13:05:00', author: 'Alexander Averin', isPersonal: true, to: 'Victoria Yaroshevich' });
const message5 = new Message({ id: 8, text: 'Cras dapibus', createdAt: '2020-10-13T13:05:00', author: 'Alexey Yaroshevich' });
const message6 = new Message({ text: 'Curabitur ullamcorper ultricies', createdAt: '2020-10-13T13:05:00', author: 'Anastasia Ostashenko' });
const message7 = new Message({ id: 10, text: 'Vivamus elementum semper nisi', createdAt: '', author: 'Victoria Yaroshevich' });
const list = new MessageList([message1, message2, message3, message4, message5, message6, message7]);
const listUsers = new UserList(['Yanina Chirko', 'Polina Skoraya', 'Alexey Yaroshevich', 'Victoria Yaroshevich', 'Alexander Averin', 'Anastasia Ostashenko'],
    ['Victoria Yaroshevich', 'Yanina Chirko', 'Alexander Averin', 'Anastasia Ostashenko']);

setCurrentUser('Victoria Yaroshevich');

addMessage({ text: 'Vivamus elementum' });

editMessage(10, { text: 'hahahahaha' });

removeMessage(10);

showMessages(0, 10, { dateFrom: '2020-10-09T11:00:00', dateTo: '2020-10-13T13:06:00' });

showUsers();
