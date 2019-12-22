export default function suggetions() {
    const obj = {
        'column': [],
        'arithmeticOperator': [{
            key: 'like',
            displayName: 'like',
            allowedTo: ['text', 'number'],
            type: 'arithmeticOperator',
            name:'like',
            strLength:4,
            hasQuotes:false
        },{
            key: 'N_Lk',
            displayName: 'Not Like',
            name:'"Not Like"',
            allowedTo: ['text', 'number'],
            type: 'arithmeticOperator',
            strLength:10,
            hasQuotes:true
        },{
            key: 'NOT',
            displayName: 'Not',
            name:'Not',
            allowedTo: ['text', 'number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:3,
            hasQuotes:false
        },{
            key: '=',
            displayName: '=',
            name:'=',
            allowedTo: ['text', 'number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:1,
            hasQuotes:false
        },{
            key: '!=',
            displayName: '!=',
            name:'!=',
            allowedTo: ['text', 'number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:2,
            hasQuotes:false
        },
        {
            key: '<',
            displayName: '<',
            name:'<',
            allowedTo: ['number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:1,
            hasQuotes:false
        },
        {
            key: '>',
            displayName: '>',
            name:'>',
            allowedTo: ['number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:1,
            hasQuotes:false
        },
        {
            key: '<=',
            displayName: '<=',
            name:'<=',
            allowedTo: ['number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:2
        },
        {
            key: '>=',
            displayName: '>=',
            name:'>=',
            allowedTo: ['number', 'between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:2,
            hasQuotes:false
        },
        {
            key: 'between',
            displayName: 'Between',
            name:'Between',
            allowedTo: ['between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:7,
            hasQuotes:false
        },
        {
            key: 'NT_bw',
            displayName: 'Not Between',
            name:'"Not Between"',
            allowedTo: ['between', 'timestamp'],
            type: 'arithmeticOperator',
            strLength:13,
            hasQuotes:true
        },
        {
            key: 'IN',
            displayName: 'In',
            name:'In',
            allowedTo: ['dropdown'],
            type: 'arithmeticOperator',
            strLength:2,
            hasQuotes:false
        },
        {
            key: 'N_I',
            displayName: 'Not In',
            name:'"Not In"',
            allowedTo: ['dropdown'],
            type: 'arithmeticOperator',
            strLength:8,
            hasQuotes:true
        }],
        'logicalOperator': [
            {
            key: ')',
            typeOfParanthesis: 'end',
            displayName: ')',
            name:')',
            type: 'endParanthesis',
            strLength:1
        }, 
        {
            key: '&&',
            displayName: 'AND',
            name:'AND',
            type: 'logicalOperator',
            strLength:3
        }, {
            key: '||',
            displayName: 'OR',
            name:'OR',
            type: 'logicalOperator',
            strLength:2
        }],
        'restrictedKeys':['!','@','#','$','%','^','&','*','=','_',';','<','>','?','`','~','like','not','in','between','>=','<=','<','>','==','!=']
    }
    return obj;
}