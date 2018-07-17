const elseObj = {
    ELSE: function(callback, continues = true) {
        callback();
        console.log(XSE.actual_sub_script);
        XSE.scripts[XSE.actual_script].subscripts[XSE.actual_sub_script].returned = false;
        if (continues){

            let pointer = XSE.makeraw();
            XSE.scripts[XSE.actual_script].subscripts[pointer] = {
                pointer: pointer,
                callback: callback,
                returned: false,
                gotoEd: null,
                printed: false,
                texto: '',
                subscripts : {
            
                }
            };
            XSE.scripts[XSE.actual_script].subscripts[XSE.actual_sub_script].gotoEd = pointer
            XSE.goTo('@' + pointer);
            //XSE.end();
            return;
        }
        
        XSE.end();
    }
}


function msgbox(text, alias){
    let type = '0x' + XSE.typesMsgBox.normal;
    XSE.msgbox({text, type, alias});
}

function question(text, callback, alias){
    let type = '0x' + XSE.typesMsgBox.boolean;
    XSE.msgbox({text, type, alias});
    XSE.compare('lastresult', 1);
    XSE.IF('=');

    let script_alias = '@' + XSE.makeraw();

    XSE.goTo(script_alias);
    XSE.scripts[script_alias] = basescript;
    XSE.scripts[script_alias].callback = callback;
    XSE.actual_sub_script = script_alias;
    return elseObj;
}

function IF(condition, callback){
    /* CONDITION IS AN ARRAY WITH LENGHT IS 3. FIRST POSITION IS THE VARIABLE TO COMPARE, SECOND IS DE CONDITION OPERATOR, AND THIRD IS THE VALUE TO COMPARE */
    if (condition.length != 3){
        throw('THE CONDITION PARAMS REQUIRED AN ARRAY WITH 3 ELEMENTS');
    }

    let var_to_compare      = condition[0];
    let val_to_compare      = condition[2];
    let cond                = condition[1];

    let script_alias = '@' + XSE.makeraw();
    
    XSE.compare(var_to_compare, val_to_compare);
    XSE.IF(cond);

    XSE.goTo(script_alias);

    let script = {
        pointer: script_alias,
        callback: callback,
        returned: true,
        gotoEd: null,
        printed: false,
        texto: '',
        subscripts : {
    
        }
    };
    
    
    
    XSE.scripts[XSE.actual_script].subscripts[script_alias] = script;
    XSE.actual_sub_script = script_alias;
    return elseObj;
}

