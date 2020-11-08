const messages = [
    {
        id: '1',
        text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        createdAt: new Date('2020-10-13T13:00:00'),
        author: 'Alexey Chirko',
        isPersonal: false,
    },
    {
        id: '2',
        text: ' Aenean massa?',
        createdAt: new Date('2020-10-13T13:10:05'),
        author: 'Yanina Minina',
        isPersonal: false
    },
    {
        id: '3',
        text: 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        createdAt: new Date('2020-10-12T15:11:00'),
        author: 'Vladimir Andreev',
        isPersonal: false
    },
    {
        id: '4',
        text: 'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.',
        createdAt: new Date('2020-10-13T13:11:20'),
        author: 'Elizaveta Petreeva',
        isPersonal: false
    },
    {
        id: '5',
        text: 'Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
        createdAt: new Date('2020-10-13T12:12:00'),
        author: 'Victoria Yaroshevich',
        isPersonal: false
    },
    {
        id: '6',
        text: 'In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo',
        createdAt: new Date('2020-10-12T08:12:50'),
        author: 'Anna Kolesnikova',
        isPersonal: true,
        to: 'Victoria Yaroshevich'
    },
    {
        id: '7',
        text: 'Nullam dictum felis eu pede mollis pretium.',
        createdAt: new Date('2020-10-12T13:13:00'),
        author: 'Anton Averin',
        isPersonal: false
    },
    {
        id: '8',
        text: 'Integer tincidunt.',
        createdAt: new Date('2020-10-12T13:14:05'),
        author: 'Anastasia Ostashenko',
        isPersonal: false
    },
    {
        id: '9',
        text: 'Cras dapibus. Vivamus elementum semper nisi.',
        createdAt: new Date('2020-10-12T12:40:00'),
        author: 'Nikolai Ivanov',
        isPersonal: true,
        to: 'Yanina Minina'
    },
    {
        id: '10',
        text: 'Aenean vulputate eleifend tellus.',
        createdAt: new Date('2020-10-12T12:15:50'),
        author: 'Mikhail Leonov',
        isPersonal: false
    },
    {
        id: '11',
        text: ' Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim',
        createdAt: new Date('2020-10-12T13:16:27'),
        author: 'Vladilen Nikonov',
        isPersonal: false
    },
    {
        id: '12',
        text: 'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.',
        createdAt: new Date('2020-10-12T10:19:00'),
        author: 'Anna Kolesnikova',
        isPersonal: false
    },
    {
        id: '13',
        text: 'Phasellus viverra nulla ut metus varius laoreet.',
        createdAt: new Date('2020-10-12T10:19:48'),
        author: 'Anna Kolesnikova',
        isPersonal: false
    },
    {
        id: '14',
        text: 'Quisque rutrum',
        createdAt: new Date('2020-10-12T13:20:00'),
        author: 'Yanina Minina',
        isPersonal: true,
        to: 'Victoria Yaroshevich'
    },
    {
        id: '15',
        text: 'Aenean imperdiet',
        createdAt: new Date('2020-10-12T09:21:45'),
        author: 'Yanina Minina',
        isPersonal: false
    },
    {
        id: '16',
        text: 'Etiam ultricies nisi vel augue.',
        createdAt: new Date('2020-10-12T13:30:00'),
        author: 'Victoria Yaroshevich',
        isPersonal: true,
        to: 'Yanina Minina'
    },
    {
        id: '17',
        text: 'Curabitur ullamcorper ultricies nisi.',
        createdAt: new Date('2020-10-12T14:31:10'),
        author: 'Anton Averin',
        isPersonal: false
    },
    {
        id: '18',
        text: 'Nam eget dui',
        createdAt: new Date('2020-10-12T12:31:27'),
        author: 'Yanina Minina',
        isPersonal: false
    },
    {
        id: '19',
        text: 'Etiam rhoncus.',
        createdAt: new Date('2020-10-12T13:35:00'),
        author: 'Alexey Chirko',
        isPersonal: false
    },
    {
        id: '20',
        text: 'Maecenas tempus, tellus eget condimentum rhoncus',
        createdAt: new Date('2020-09-09T10:36:15'),
        author: 'Elizaveta Petreeva',
        isPersonal: false
    },
    {
        id: '21',
        text: 'Sem quam semper libero',
        createdAt: new Date('2020-09-09T10:36:15'),
        author: 'Elizaveta Petreeva',
        isPersonal: false
    },
    {
        id: '22',
        text: 'Sit amet adipiscing sem neque sed ipsum.',
        createdAt: new Date('2020-09-09T10:36:15'),
        author: 'Elizaveta Petreeva',
        isPersonal: false
    },
    {
        id: '23',
        text: 'Maecenas nec odio et ante tincidunt tempus',
        createdAt: new Date('2020-09-09T10:36:15'),
        author: 'Elizaveta Petreeva',
        isPersonal: true,
        to: 'Victoria Yaroshevich'
    },
    {
        id: '24',
        text: 'Maecenas nec odio et ante tincidunt tempus',
        createdAt: new Date('2020-09-09T10:36:15'),
        author: '',
        isPersonal: true,
        to: 'Victoria Yaroshevich'
    },
];

const messagesModule = (function () {
    const filterObj = {
        author: (message, author) => author && message.author.toLowerCase().includes(author.toLowerCase()),
        text:  (message, text) => text && message.text.toLowerCase().includes(text.toLowerCase()),
        dateTo:  (message, dateTo) => dateTo && message.createdAt < new Date(dateTo),
        dateFrom:  (message, dateFrom) => dateFrom && message.createdAt > new Date(dateFrom)
    };

    const validateObj = {
        text: (message) => message.text && message.text.length <= 200
    };

    let currentAuthor = 'Elizaveta Petreeva';

    return {
        getMessages:
            function (skip = 0, top = 10, filterConfig = {}) {
                let arrMessages = messages.slice();
                Object.keys(filterConfig).forEach((key) => {
                    arrMessages = arrMessages.filter((message) => filterObj[key](message, filterConfig[key]));
                });
                arrMessages.sort((d1, d2) => d1.createdAt - d2.createdAt);
                arrMessages.splice(0, skip);
                if (arrMessages.length > top) {
                    arrMessages.splice(top);
                }
                return arrMessages;
            },

        getMessage:
            function (id = '') {
              return messages.find((message) => message.id === id);
            },

        validateMessage:
            function (msg = {}) {
                return Object.keys(validateObj).every((key) => validateObj[key](msg));
            },

        addMessage:
            function (msg = {}) {
                if (this.validateMessage(msg)) {
                    msg.id = `${+new Date()}`;
                    msg.createdAt = new Date();
                    msg.author = currentAuthor;
                    messages.push(msg);
                    return true;
                } else return false;
            },

        editMessage:
            function(id='', msg={}){
                let index = messages.indexOf(this.getMessage(id));
                if(index !== -1) {
                    let result = this.getMessage(id);
                    result.text = msg.text;
                    return (this.validateMessage(result));
                }else return false;
            },

        removeMessage:
            function (id = '') {
                let index = messages.indexOf(this.getMessage(id));
                if(index !== -1) {
                    messages.splice(index, 1);
                    return true;
                }return false;
            }
    }
}
());
console.log(messagesModule.getMessages(0, 10, {
    author: 'Elizaveta',
    text: 'nec odio',
    dateFrom: '2020-08-08',
    dateTo: '2020-10-10'
}))
console.log(messagesModule.getMessages(12, 10))
console.log(messagesModule.getMessages(0, 10, {text: 'adipiscing'}))
console.log(messagesModule.getMessages(0, 10, {author: 'Victoria'}))

console.log(messagesModule.getMessage('1'))
console.log(messagesModule.getMessage('20'))

console.log(messagesModule.validateMessage({
    text: 'Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
    createdAt: new Date('2020-09-09T13:36:15'),
    author: 'Elizaveta Petreeva',
    isPersonal: false
}))
console.log(messagesModule.validateMessage({
    createdAt: new Date('2020-09-09T13:36:15'),
    author: 'Elizaveta Petreeva',
    isPersonal: false
}))

console.log(messagesModule.addMessage({
    text: 'vulputate eget, arcu',
    isPersonal: false
}))
console.log(messagesModule.addMessage({
    isPersonal: false
}))

console.log(messagesModule.editMessage('24', {text: 'bla'}))
console.log(messagesModule.editMessage('30', {text: 'bla'}))

console.log(messagesModule.removeMessage('1'))
console.log(messagesModule.removeMessage('26'))

