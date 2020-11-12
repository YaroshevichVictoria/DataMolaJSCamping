class Message {
    constructor(msg = {}) {
        this._id = msg.id || `${+new Date()}`;
        this.text = msg.text;
        this._createdAt = msg.createdAt && msg.createdAt !== '' ? new Date(msg.createdAt) : new Date();
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
    _user;

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

    edit(idNew, msg = {}) {
        if (this.user) {
            const foundMessage = this.get(idNew);
            if (MessageList.validate(foundMessage) && MessageList.validEditMessage(msg) && foundMessage.author === this.user) {
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

const message1 = new Message({ id: 6, text: 'Lorem ipsum', createdAt: '2020-10-13T13:05:00', author: 'Yanina Chirko', isPersonal: false });
const message2 = new Message({ text: 'dolor sit amet', author: 'Victoria Yaroshevich', isPersonal: false });
const list = new MessageList([message1]);
list.user = 'Victoria Yaroshevich';

console.log(list.add(message2));
console.log(list.add({ id: 7, text: 'porttitor eu', createdAt: '2020-10-13T13:05:00', author: 'Alexander Averin', isPersonal: true, to: 'Victoria Yaroshevich' }));
console.log(list.add({ id: 8, text: 'Cras dapibus', createdAt: '2020-10-13T13:05:00', author: list.user, isPersonal: true, to: 'Yanina Chirko' }));
console.log(list.add({ id: 9, text: 'consequat vitae' }));

console.log(list.edit(8, { text: 'How do you do?', to: 'Alexander Averin' }));
console.log(list.edit(7, { text: 'Hello' }));
list.user = 'Alexander Averin';
console.log(list.edit(7, { text: 'Hello' }));

console.log(list.get(7));

console.log(list.getPage(0, 10, { dateFrom: '2020-10-12T11:00:00', dateTo: '2020-11-13T14:00:00' }));
list.user = 'Yanina Chirko';
console.log(list.getPage(0, 10, { dateTo: '2020-11-13T14:00:00' }));

console.log(list.remove(7));
list.user = 'Victoria Yaroshevich';
console.log(list.remove(8));
console.log(list.remove(9));

console.log(list.addAll([
    { id: 10, text: 'Vivamus elementum semper nisi', createdAt: '', author: 'Victoria Yaroshevich', isPersonal: false },
    { text: 'Curabitur ullamcorper ultricies', createdAt: '2020-10-13T13:05:00', author: 'hgflkh', isPersonal: false },
    { id: 12 }]));
list.clear();
console.log(list);
