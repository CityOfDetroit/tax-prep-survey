import React, { useState, useEffect } from 'react';
import './Form.scss';
import Body from '../Body/Body';
import Geocoder from '../Geocoder/Geocoder';
import Connector from '../Connector/Connector';

function Form(props) {

    const {
        appID       : [appID, setAppID],
        step        : [step, setStep],
        stepHistory : [stepHistory, setStepHistory],
        formData    : [formData, setFormData],
        buildType   : [buildType, setBuildType]
    } = {
        appID       : useState(),
        step        : useState(),
        stepHistory : useState(),
        formData    : useState(),
        buildType   : useState(),
        ...(props.state || {})
    };
    const [error, setError]             = useState();
    const [btnState, setbtnState]       = useState();
    const [extras, setExtras]           = useState();
    const [extrasCount, setExtrasCount] = useState(0);
    const [otherInput, setOtherInput]   = useState();

    // ================== Builder Section ====================
    const buildContent = () => {
        const formClass = `${props.type} ${props.position}`; 
        const markup = 
        <form id={props.id} className={formClass} onSubmit={handleSubmit}>
            <Body type={props.text.type} content={props.text.markup}></Body>
            {buildSections()}
        </form>
        return markup;
    }

    const buildSections = () => {
        const markup = props.sections.map((section) =>
           <section key={section.id} className="grouping">
               {buildExtras()}
               {buildItems(section.items)}
           </section>
        );
        return markup;
    }

    const buildExtra = (extra) => {
        let markup;
        switch (extra.type) {
            case "geocoder":
                markup = <Geocoder 
                key={extra.id}
                id={extra.id} 
                name={extra.id} 
                placeholder={extra.placeholder} 
                required={true}
                ariaRequired={true}
                label={extra.label} 
                ></Geocoder>;
                break;

            case "text":
                markup = 
                <div>
                    <label htmlFor={extra.id} className={getLabelClass(true)}>{extra.label}</label>
                    <input key={extra.id} type={extra.type} id={extra.id} name={extra.name} aria-label={extra.id} placeholder={extra.placeholder} required={true} aria-required={true}></input>
                </div>;
                break;

            case "checkbox":
                markup = 
                <div>
                   <input type={extra.type} id={extra.id} name={extra.name} aria-label={extra.name} value={extra.value} onChange={handleChange} required={extra.required} aria-required={extra.required} onChange={handleGroupingRequired} data-grouping={extra.grouping}></input>
                   <label htmlFor={extra.id} className={getLabelClass(true)}>{extra.label}</label>
                </div>;
                break;

            case "file":
                markup =
                <div>
                    <label htmlFor={extra.id} className={getLabelClass(true)}>{extra.label}</label>
                    <input key={extra.id} type={extra.type} id={extra.id} name={extra.name} aria-label={extra.id} required={true} aria-required={true}></input>
                </div>;
                break;
        
            default:
                break;
        }
        return markup;
    }

    const buildExtras = () => {
        let extrasArr = [];
        let markup;
        if(extrasCount > 0){
            if(extras.getAttribute('data-ismulti-component')){
                for (let index = 0; index < extrasCount; index++){
                    JSON.parse(extras.getAttribute('data-multicomponents')).forEach((comp) => {
                        let tempComponent = {};
                        tempComponent.id = `${comp.otherID}-${index + 1}`;
                        tempComponent.placeholder = comp.otherPlaceholder;
                        tempComponent.value = comp.otherValue;
                        tempComponent.label = comp.otherLabel;
                        tempComponent.required = comp.otherRequire;
                        tempComponent.grouping = comp.otherGrouping;
                        tempComponent.type = comp.specialAttribute;
                        if(comp.otherName != null){
                            tempComponent.name = `${comp.otherName}-${index + 1}`;
                        }
                        extrasArr.push(tempComponent);
                    });
                }
            }else{
                for (let index = 0; index < extrasCount; index++) {
                    let tempComponent = {};
                    tempComponent.id = `${extras.getAttribute('data-special-id')}-${index + 1}`;
                    tempComponent.placeholder = extras.getAttribute('data-special-text');
                    tempComponent.value = null;
                    tempComponent.label = extras.getAttribute('data-special-label');
                    tempComponent.type = extras.getAttribute('data-special-type');
                    extrasArr.push(tempComponent);
                }
            }
            
        }
        markup = extrasArr.map((extra) => buildExtra(extra));
        return markup;
    }

    const buildOtherInputOption = (e) => {
        let container = document.createElement('div');
        let input = document.createElement('input');
        let label = document.createElement('label');
        container.id = `${e.getAttribute('data-special-id')}-container`;
        container.className = "other-input";
        label.innerText = e.getAttribute('data-special-label');
        container.appendChild(label);
        container.appendChild(input);
        input.type = 'text';
        input.id = e.getAttribute('data-special-id');
        input.required = true;
        input.setAttribute('placeholder', e.getAttribute('data-special-text'));
        input.setAttribute('name', e.name);
        return container;
    }

    const buildItems = (items) => {
        const markup = items.map((item, index) => 
            <div key={item.id}>
                {(item.labelPosition != "after") ? (item.label) ? <label htmlFor={item.id} className={getLabelClass(item.required)}>{item.labelText}</label> : '' : ''}
                {buildTag(item, index)}
                {(item.labelPosition == "after") ? (item.label) ? <label htmlFor={item.id} className={getLabelClass(item.required)}>{item.labelText}</label> : '' : ''}
            </div>
        );
        return markup;
    }

    const getLabelClass = (data) => {
        let tempClass = '';
        (data) ? tempClass = "required-field" : tempClass = "";
        return tempClass;
    }

    const checkPreviousAnswer = (item, index, tag, type) => {
        if(props.savedData){
            if(formData == undefined){
                return false;
            }else{
                if(formData[props.id] == undefined){
                    return false
                }else{
                    switch (tag) {
                        case 'button':
                            if(formData[props.id][props.id] == item.text){
                                return true;
                            }else{
                                return false;
                            }
                            break;

                        case 'select':
                            return true;
                            break;

                        case 'GEOCODER':
                            return true;
                            break;

                        case 'textarea':
                            return true;
                            break;

                        case 'input':
                            switch (type) {
                                case 'radio':
                                    let isFound;
                                    if(formData[props.id][item.name].includes(item.value)){
                                        isFound = true;
                                    }else{
                                        isFound = false;
                                    }
                                    return isFound;
                                    break;

                                case 'checkbox':
                                    let isChecked;
                                    if(formData[props.id][item.name].includes(item.value)){
                                        isChecked = true;
                                    }else{
                                        isChecked = false;
                                    }
                                    return isChecked;
                                    break;
                            
                                default:
                                    return true;
                                    break;
                            }
                            break;
                    
                        default:
                            break;
                    }
                }
            }
        }else{
            return false;
        }
    }

    const buildTag = (item, index) =>{
        let markup;
        switch (item.tag) {
            case 'button':
                switch (item.type) {
                    case 'submit':
                        if(checkPreviousAnswer(item, index, item.tag, item.type)){
                            markup = <button className="selected" role="button" aria-label={item.name} onClick={(e)=>{setbtnState(e.target.innerText)}} type={item.type}>{item.text}</button>;
                        }else{
                            markup = <button role="button" aria-label={item.name} onClick={(e)=>{setbtnState(e.target.innerText)}} type={item.type}>{item.text}</button>;
                        }
                        break;
    
                    case 'button':
                        switch (item.text) {
                            case 'Add':
                                markup = <button role="button" aria-label={item.name} onClick={(e)=>{setExtrasCount(extrasCount + 1); setExtras(e.target)}} type={item.type} data-special-type={item.specialAttribute} data-special-text={item.otherPlaceholder} data-special-label={item.otherLabel} data-special-id={item.otherID} data-ismulti-component={item.isMultiComponent} data-multicomponents={JSON.stringify(item.multiComponents)}>{item.text}</button>;
                                break;

                            case 'Remove':
                                markup = <button 
                            role="button" 
                            aria-label={item.name} 
                            onClick={(e)=>{
                                if(extrasCount > 0){setExtrasCount(extrasCount - 1);setExtras(e.target);} 
                            }} 
                            type={item.type} data-special-type={item.specialAttribute} data-special-text={item.otherPlaceholder} data-special-label={item.otherLabel} data-special-id={item.otherID} data-ismulti-component={item.isMultiComponent} data-multicomponents={JSON.stringify(item.multiComponents)}>{item.text}</button>;
                                break;
                        
                            default:
                                break;
                        }
                        break;
                
                    default:
                        break;
                }
                break;

            case 'select':
                if(checkPreviousAnswer(item, index, item.tag, item.type)){
                    markup = markup = <select id={item.id} name={item.name} aria-label={item.name} defaultValue={formData[props.id][item.id]}>{buildSelectOptions(item.id, item.selectOptions)}</select>;
                }else{
                    markup = <select id={item.id} name={item.name} aria-label={item.name} >{buildSelectOptions(item.id, item.selectOptions)}</select>;
                }
                break;

            case 'textarea':
                if(checkPreviousAnswer(item, index, item.tag, item.type)){
                    markup = <textarea id={item.id} name={item.name} defaultValue={formData[props.id][item.id]} aria-label={item.name} placeholder={item.placeholder} maxLength={item.maxLength} required={item.required} aria-required={item.required}></textarea>;
                }else{
                    markup = <textarea id={item.id} name={item.name} aria-label={item.name} placeholder={item.placeholder} maxLength={item.maxLength} required={item.required} aria-required={item.required}></textarea>;
                }
                break;

            case 'GEOCODER':
                if(checkPreviousAnswer(item, index, item.tag, item.type)){
                    markup = 
                    <Geocoder 
                    id={item.id} 
                    name={item.name} 
                    placeholder={item.placeholder} 
                    required={false}
                    ariaRequired={item.required}
                    label={item.labelText}
                    parcel={formData[props.id][`${item.id}-parcel`]}
                    savedValue={formData[props.id][item.id]}
                    value={item.value}
                    ></Geocoder>;
                }else{
                    markup = 
                    <Geocoder 
                    id={item.id} 
                    name={item.name} 
                    placeholder={item.placeholder} 
                    required={item.required} 
                    ariaRequired={item.required}
                    label={item.labelText}
                    parcel={null}
                    value={item.value}
                    ></Geocoder>;
                }
                break;
        
            default:
                switch (item.type) {
                    case 'radio':
                        markup = addspecialType(item, index);
                        break;

                    case 'checkbox':
                        if(checkPreviousAnswer(item, index, item.tag, item.type)){
                            markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required} onChange={handleGroupingRequired} data-grouping={item.grouping} defaultChecked={true}></input>;
                        }else{
                            markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required} onChange={handleGroupingRequired} data-grouping={item.grouping}></input>;
                        }
                        break;
                    
                    case 'text':
                        if(checkPreviousAnswer(item, index, item.tag, item.type)){
                            markup = <input type={item.type} id={item.id} name={item.name} defaultValue={formData[props.id][item.id]} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }else{
                            markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }
                        break;

                    case 'file':
                        markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} disabled={item.disabled} required={item.required} aria-required={item.required}></input>;
                        break;

                    case 'number':
                        if(checkPreviousAnswer(item, index, item.tag, item.type)){
                            markup = <input type={item.type} id={item.id} name={item.name} defaultValue={formData[props.id][item.id]} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }else{
                            markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }
                        break;

                    case 'date':
                        if(checkPreviousAnswer(item, index, item.tag, item.type)){
                            markup = <input type={item.type} id={item.id} name={item.name} defaultValue={formData[props.id][item.id]} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }else{
                            markup = <input type={item.type} id={item.id} name={item.name} aria-label={item.name} disabled={item.disabled} placeholder={item.placeholder} required={item.required} aria-required={item.required}></input>;
                        }
                        break;
                
                    default:
                        markup = <item.tag type={item.type} aria-label={item.name} id={item.id}>
                        {item.text}
                        </item.tag>;
                        break;
                }
                break;
        }
        return markup;
    }

    const buildSelectOptions = (id,options) => {
        const markup = options.map((option, index) => 
            <option key={buildNewKey(id,index)} value={option.value}>{option.text}</option>
        );
        return markup;
    }

    const buildNewKey = (id, index) => {
        return `${id}-${index}`;
    }

    const addspecialType = (item, index) => {
        if(item.hasSpecialAttribute){
            if(checkPreviousAnswer(item, index, item.tag, item.type)){
                return <input type={item.type} id={item.id} name={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required} data-special-type={item.specialAttribute} data-special-text={item.otherPlaceholder} data-special-label={item.otherLabel} data-special-id={item.otherID} defaultChecked={true}></input>;
            }else{
                return <input type={item.type} id={item.id} name={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required} data-special-type={item.specialAttribute} data-special-text={item.otherPlaceholder} data-special-label={item.otherLabel} data-special-id={item.otherID}></input>;
            }
        }else{
            if(checkPreviousAnswer(item, index, item.tag, item.type)){
                return <input type={item.type} id={item.id} name={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required} defaultChecked={true}></input>;
            }else{
                return <input type={item.type} id={item.id} name={item.name} value={item.value} onChange={handleChange} required={item.required} aria-required={item.required}></input>;
            }
        }
    }

    // ================== Handler  Section ====================
    const handleAPICalls = (e, callType, currentStep, nextStep, isFinalStep) => {
        let tempHistory;
        if(e.status >= 200 && e.status < 300){
            switch (callType) {
                case 'getID':
                    e.json().then(data => {
                        setAppID(data.id);
                    });
                    tempHistory = stepHistory;
                    let duplicate = tempHistory.some((l, index) => {
                        return l === currentStep; 
                    }); 
                    if(!duplicate){
                        tempHistory.push(currentStep);
                    }
                    setStepHistory(tempHistory);
                    setStep(nextStep);
                    break;

                case 'saveForm':
                    if(isFinalStep){
                        Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/finish/`,null,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'finish', currentStep, nextStep)},(e)=>{handleAPICalls(e, 'finish', currentStep)});
                    }else{
                        tempHistory = stepHistory;
                        tempHistory.push(currentStep);
                        setStepHistory(tempHistory);
                        setStep(nextStep);
                    }
                    break;

                case 'getStatus':
                    e.json().then(data => {
                        switch (data.status) {
                            case 'incomplete':
                                tempHistory = stepHistory;
                                tempHistory.push(currentStep);
                                setStepHistory(tempHistory);
                                setStep(1);
                                break;

                            case 'complete':
                                tempHistory = stepHistory;
                                tempHistory.push(currentStep);
                                setStepHistory(tempHistory);
                                setStep(2);
                                break;
                        
                            default:
                                break;
                        }
                    });
                    break;

                case 'loadApplication':
                    e.json().then(data => {
                        setAppID(data.id);
                        setFormData(data.answers);
                        tempHistory = stepHistory;
                        tempHistory.push(currentStep);
                        setStepHistory(tempHistory);
                        setStep(1);
                    });
                    break;

                default:
                    tempHistory = stepHistory;
                    tempHistory.push(currentStep);
                    setStepHistory(tempHistory);
                    setStep(nextStep);
                    break;
            }
        }else if(e.status == 404){
            switch (callType) {
                case 'getID':
                    break;

                case 'saveForm':
                    break;

                case 'loadApplication':
                    break;

                default:;
                    break;
            }
        }else{
            switch (callType) {
                case 'getID':
                    break;

                case 'saveForm':
                    break;

                case 'loadApplication':
                    break;

                default:
                    break;
            }
        }
    }

    const handleGroupingRequired = (e) => {
        let isChecked = false;
        if(e.target.getAttribute('data-grouping') == 'true'){
            Array.from(e.target.parentElement.parentElement.parentElement.elements).forEach(element => {
                if(element.checked){
                    isChecked = true;
                }
            });
            if(isChecked){
                Array.from(e.target.parentElement.parentElement.parentElement.elements).forEach(element => {
                    element.required = false;
                });
            }
        }
    }

    const handleChange = (e) => {
        switch (e.target.getAttribute('data-special-type')) {
            case 'other':
                setOtherInput(`${e.target.getAttribute('data-special-id')}-container`);
                e.target.parentElement.after(buildOtherInputOption(e.target));
                break;
        
            default:
                if(otherInput){
                    document.getElementById(otherInput).remove();
                    setOtherInput(undefined);
                }
                break;
        }
        Array.from(e.target.parentElement.parentElement.parentElement.elements).forEach(element => {
            if(element.tagName == 'INPUT'){
                element.checked = false;
            }
        });
        e.target.checked = true;
    }

    const handleButtonForms = (ev, requirements) => {
        let tempFormData = {};
        let postData     = {answers:null};
        let tempHistory  = [];
        if(requirements.logic.length){
            let currentLogic; 
            requirements.logic.some((l, index) => {
                currentLogic = index;
                switch (l.validationType) {
                    case 'equal':
                        return l.validation === btnState;   
                        break;
                
                    default:
                        break;
                }
            }); 
            if(requirements.needsNewID){
                if(appID == undefined){
                    Connector.start('post','https://apis.detroitmi.gov/property_applications/start/',null,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'getID', step, requirements.logic[currentLogic].next, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'getID', step)});
                }
            }
            if(requirements.logic[currentLogic].isSwitchingFormType){
                setBuildType(requirements.logic[currentLogic].formType);
                setStep(requirements.logic[currentLogic].next);
            }else{
                if(requirements.isPosting){
                    if(requirements.logic[currentLogic].specialTask != null){
                        switch (requirements.logic[currentLogic].specialTask.taskType) {
                            case 'copy':
                                if(formData != undefined){
                                    tempFormData = formData;
                                }
                                tempFormData[requirements.logic[currentLogic].specialTask.copyCommand.destination] = formData[requirements.logic[currentLogic].specialTask.copyCommand.origin];
                                setFormData(tempFormData);
                                break;
    
                            case 'delete':
                                if(formData != undefined){
                                    tempFormData = formData;
                                }
                                if(tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item] != undefined){
                                    delete tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item];   
                                }
                                setFormData(tempFormData);
                                break;
                        
                            default:
                                break;
                        }
                    }
                    if(formData != undefined){
                        tempFormData = formData;
                    }
                    let tempObj = {};
                    tempObj[ev.target.id] = btnState;
                    tempFormData[ev.target.id] = tempObj;
                    setFormData(tempFormData);
                    postData.answers = tempFormData;
                    Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, requirements.logic[currentLogic].next, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                }else{
                    tempHistory = stepHistory;
                    tempHistory.push(step);
                    setStepHistory(tempHistory);
                    setStep(requirements.logic[currentLogic].next);
                }
            }
        }else{
            if(requirements.needsNewID){
                if(appID == undefined){
                    Connector.start('post','https://apis.detroitmi.gov/property_applications/start/',null,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'getID', step, requirements.nextGlobal, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'getID', step)});
                }
            }
            if(requirements.isPosting){
                if(formData != undefined){
                    tempFormData = formData;
                }
                let tempObj = {};
                tempObj[ev.target.id] = btnState;
                tempFormData[ev.target.id] = tempObj;
                setFormData(tempFormData);
                postData.answers = tempFormData;
                switch (requirements.postingTypeGlobal) {
                    case 'answers':
                        Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, requirements.nextGlobal, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                        break;
                
                    default:
                        break;
                }
            }else{
                if(requirements.isSwitchingFormTypeGlobal){
                    setBuildType(requirements.formTypeGlobal);
                }
                if(requirements.historyOverrite != null){
                    setStepHistory(requirements.historyOverrite);
                }else{
                    tempHistory = stepHistory;
                    tempHistory.push(step);
                    setStepHistory(tempHistory);
                }
                setStep(requirements.nextGlobal);
            }
        }
    }

    const handleInputTextForms = (ev, requirements) => {
        let inputData    = {};
        let tempFormData = {};
        let postData     = {answers:null};
        let tempHistory  = [];
        if(requirements.logic.length){

        }else{
            if(requirements.needsNewID){
                if(appID == undefined){
                    Connector.start('post','https://apis.detroitmi.gov/property_applications/start/',null,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'getID', step, requirements.nextGlobal, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'getID', step)});
                }
            }
            if(requirements.isPosting){
                for (let index = 0; index < ev.target.elements.length; index++) {
                    if(ev.target.elements[index].tagName == 'INPUT' || ev.target.elements[index].tagName == 'SELECT' || ev.target.elements[index].tagName == 'TEXTAREA'){
                        if(ev.target.elements[index].type == 'checkbox' || ev.target.elements[index].type == 'radio'){
                            if(ev.target.elements[index].checked == true){
                                inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                            }
                        }else{
                            inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                        }
                        if(ev.target.elements[index].getAttribute('data-parcel') != undefined){
                            inputData[`${ev.target.elements[index].id}-parcel`] = ev.target.elements[index].getAttribute('data-parcel');
                        }
                    }
                }
                if(formData != undefined){
                    tempFormData = formData;
                }
                tempFormData[ev.target.id] = inputData
                setFormData(tempFormData);
                postData.answers = tempFormData;
                Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, requirements.nextGlobal, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
            }
            if(requirements.isGetting){
                if(requirements.isPostingFullForm){
                    
                }else{
                    for (let index = 0; index < ev.target.elements.length; index++) {
                        if(ev.target.elements[index].tagName == 'INPUT' || ev.target.elements[index].tagName == 'SELECT' || ev.target.elements[index].tagName == 'TEXTAREA'){
                            inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                        }
                    }
                    switch (requirements.postingTypeGlobal) {
                        case 'status':
                            Connector.start('get',`https://apis.detroitmi.gov/property_applications/${inputData['app-id']}/status/`,null,false,null,'application/json',(e)=>{handleAPICalls(e, 'getStatus', step)},(e)=>{handleAPICalls(e, 'getStatus', step)});
                            break;

                        case 'answers':
                            Connector.start('get',`https://apis.detroitmi.gov/property_applications/${inputData['app-id']}/answers/`,null,false,null,'application/json',(e)=>{handleAPICalls(e, 'loadApplication', step)},(e)=>{handleAPICalls(e, 'getStatus', step)});
                            break;
                    
                        default:
                            break;
                    }
                }
            }
        }
    }

    const handleRadioForms = (ev, requirements) => {
        let specialType  = false;
        let inputData    = {};
        let tempFormData = {};
        let postData     = {answers:null};
        let tempHistory  = [];
        let currentLogic, currentMultiLogic, currentNext; 
        if(requirements.logic.length){
            for (let index = 0; index < ev.target.elements.length; index++) {
                if(ev.target.elements[index].tagName == 'INPUT'){
                    if(ev.target.elements[index].type == 'radio'){
                        if(ev.target.elements[index].checked == true){
                            if(inputData[ev.target.elements[index].name] == undefined){
                                inputData[ev.target.elements[index].name] = [ev.target.elements[index].value];
                            }else{
                                inputData[ev.target.elements[index].name].push(ev.target.elements[index].value);
                            }
                        }
                    }else{
                        inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                    }
                }
            }
            if(formData != undefined){
                tempFormData = formData;
            }
            tempFormData[ev.target.id] = inputData;
            requirements.logic.some((l, index) => {
                currentLogic = index;
                switch (l.validationType) {
                    case 'equal':
                        return inputData[l.id].includes(l.validation);   
                        break;
                
                    default:
                        break;
                }
            }); 
            if(requirements.logic[currentLogic].multiLogic){
                requirements.logic[currentLogic].multiLogicOpts.some((m, index) => {
                    currentMultiLogic = index;
                    switch (m.validationType) {
                        case 'equal':
                            return formData[m.question][l.id].includes(m.validation);
                            break;
                    
                        default:
                            break;
                    }
                }); 
                if(requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask != null){
                    switch (requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.taskType) {
                        case 'copy':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.copyCommand.destination] = formData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.copyCommand.origin];
                            setFormData(tempFormData);
                            break;

                        case 'delete':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            if(tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.deleteCommand.item] != undefined){
                                delete tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.deleteCommand.item];   
                            }
                            setFormData(tempFormData);
                            break;
                    
                        default:
                            break;
                    }
                }
                currentNext = requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].next;
            }else{
                if(requirements.logic[currentLogic].specialTask != null){
                    switch (requirements.logic[currentLogic].specialTask.taskType) {
                        case 'copy':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            tempFormData[requirements.logic[currentLogic].specialTask.copyCommand.destination] = formData[requirements.logic[currentLogic].specialTask.copyCommand.origin];
                            setFormData(tempFormData);
                            break;

                        case 'delete':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            if(tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item] != undefined){
                                delete tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item];
                            }
                            setFormData(tempFormData);
                            break;
                    
                        default:
                            break;
                    }
                }
                currentNext = requirements.logic[currentLogic].next;
            }
            switch (true) {
                case requirements.isPosting == true:
                    postData.answers = tempFormData;
                    Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, currentNext, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                    break;

                case requirements.isGetting == true:
                    break;
            
                default:
                    if(requirements.isSwitchingFormTypeGlobal){
                        setBuildType(requirements.formTypeGlobal);
                    }
                    if(requirements.historyOverrite != null){
                        setStepHistory(requirements.historyOverrite);
                    }else{
                        tempHistory = stepHistory;
                        tempHistory.push(step);
                        setStepHistory(tempHistory);
                    }
                    setStep(currentNext);
                    break;
            }
        }else{

        }
    }

    const handleInputCheckboxForms = (ev, requirements) => {
        let specialType  = false;
        let inputData    = {};
        let tempFormData = {};
        let postData     = {answers:null};
        let tempHistory  = [];
        let currentLogic, currentMultiLogic, currentNext; 
        if(requirements.logic.length){
            for (let index = 0; index < ev.target.elements.length; index++) {
                if(ev.target.elements[index].tagName == 'INPUT'){
                    if(ev.target.elements[index].type == 'checkbox'){
                        if(ev.target.elements[index].checked == true){
                            if(inputData[ev.target.elements[index].name] == undefined){
                                inputData[ev.target.elements[index].name] = [ev.target.elements[index].value];
                            }else{
                                inputData[ev.target.elements[index].name].push(ev.target.elements[index].value);
                            }
                        }
                    }else{
                        inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                    }
                }
            }
            if(formData != undefined){
                tempFormData = formData;
            }
            tempFormData[ev.target.id] = inputData;
            requirements.logic.some((l, index) => {
                currentLogic = index;
                switch (l.validationType) {
                    case 'equal':
                        return  inputData[l.id].includes(l.validation);   
                        break;
                
                    default:
                        break;
                }
            }); 
            if(requirements.logic[currentLogic].multiLogic){
                requirements.logic[currentLogic].multiLogicOpts.some((m, index) => {
                    currentMultiLogic = index;
                    switch (m.validationType) {
                        case 'equal':
                            return formData[m.question][l.id].includes(m.validation);
                            break;
                    
                        default:
                            break;
                    }
                }); 
                if(requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask != null){
                    switch (requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.taskType) {
                        case 'copy':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.copyCommand.destination] = formData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.copyCommand.origin];
                            setFormData(tempFormData);
                            break;

                        case 'delete':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            if(tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.deleteCommand.item] != undefined){
                                delete tempFormData[requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].specialTask.deleteCommand.item];   
                            }
                            setFormData(tempFormData);
                            break;
                    
                        default:
                            break;
                    }
                }
                currentNext = requirements.logic[currentLogic].multiLogicOpts[currentMultiLogic].next;
            }else{
                if(requirements.logic[currentLogic].specialTask != null){
                    switch (requirements.logic[currentLogic].specialTask.taskType) {
                        case 'copy':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            tempFormData[requirements.logic[currentLogic].specialTask.copyCommand.destination] = formData[requirements.logic[currentLogic].specialTask.copyCommand.origin];
                            setFormData(tempFormData);
                            break;

                        case 'delete':
                            if(formData != undefined){
                                tempFormData = formData;
                            }
                            if(tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item] != undefined){
                                delete tempFormData[requirements.logic[currentLogic].specialTask.deleteCommand.item];
                            }
                            setFormData(tempFormData);
                            break;
                    
                        default:
                            break;
                    }
                }
                currentNext = requirements.logic[currentLogic].next;
            }
            switch (true) {
                case requirements.isPosting == true:
                    postData.answers = tempFormData;
                    Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, currentNext, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                    break;

                case requirements.isGetting == true:
                    break;
            
                default:
                    if(requirements.isSwitchingFormTypeGlobal){
                        setBuildType(requirements.formTypeGlobal);
                    }
                    if(requirements.historyOverrite != null){
                        setStepHistory(requirements.historyOverrite);
                    }else{
                        tempHistory = stepHistory;
                        tempHistory.push(step);
                        setStepHistory(tempHistory);
                    }
                    setStep(currentNext);
                    break;
            }
        }else{
            for (let index = 0; index < ev.target.elements.length; index++) {
                if(ev.target.elements[index].tagName == 'INPUT'){
                    if(ev.target.elements[index].type == 'checkbox'){
                        if(ev.target.elements[index].checked == true){
                            if(inputData[ev.target.elements[index].name] == undefined){
                                inputData[ev.target.elements[index].name] = [ev.target.elements[index].value];
                            }else{
                                inputData[ev.target.elements[index].name].push(ev.target.elements[index].value);
                            }
                        }
                    }else{
                        inputData[ev.target.elements[index].id] = ev.target.elements[index].value;
                    }
                }
            }
            if(formData != undefined){
                tempFormData = formData;
            }
            tempFormData[ev.target.id] = inputData;
            currentNext = requirements.nextGlobal;
            switch (true) {
                case requirements.isPosting == true:
                    postData.answers = tempFormData;
                    Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/answers/`,postData,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'saveForm', step, currentNext, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                    break;

                case requirements.isGetting == true:
                    break;
            
                default:
                    if(requirements.isSwitchingFormTypeGlobal){
                        setBuildType(requirements.formTypeGlobal);
                    }
                    if(requirements.historyOverrite != null){
                        setStepHistory(requirements.historyOverrite);
                    }else{
                        tempHistory = stepHistory;
                        tempHistory.push(step);
                        setStepHistory(tempHistory);
                    }
                    setStep(currentNext);
                    break;
            }
        }
    }

    const handleFileForms = (ev, requirements) => {
        let attachments  = 0;
        let postData     = {answers:null};
        let tempHistory  = [];
        if(requirements.logic.length){

        }else{
            if(requirements.needsNewID){
                if(appID == undefined){
                    Connector.start('post','https://apis.detroitmi.gov/property_applications/start/',null,true,props.token,'application/json',(e)=>{handleAPICalls(e, 'getID', step, requirements.nextGlobal, requirements.isFinalStep)},(e)=>{handleAPICalls(e, 'getID', step)});
                }
            }
            if(requirements.isPosting){
                postData = new FormData();
                for (let index = 0; index < ev.target.elements.length; index++) {
                    if(ev.target.elements[index].tagName == 'INPUT'){
                        if( ev.target.elements[index].files.length > 0 ){
                            postData.append(ev.target.elements[index].id, ev.target.elements[index].files[0]);
                            attachments++;
                        }
                        
                    }
                }
                if(attachments > 0){
                    Connector.start('post',`https://apis.detroitmi.gov/property_applications/${appID}/attachments/`,postData,true,props.token,'multipart/form',(e)=>{handleAPICalls(e, 'saveForm', step, requirements.nextGlobal)},(e)=>{handleAPICalls(e, 'saveForm', step)});
                }else{
                    tempHistory = stepHistory;
                    tempHistory.push(step);
                    setStepHistory(tempHistory);
                    setStep(requirements.nextGlobal);
                }
            }
            if(requirements.isGetting){
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let specialType  = false;
        let attachments  = 0;
        let tempFormData = {};
        let inputData    = [];
        let tempHistory  = [];
        let postData     = {answers:null};
        let nextStep;
        switch (props.requirements.inputType) {
            case 'button':
                handleButtonForms(e, props.requirements);
                break;

            case 'input-text':
                handleInputTextForms(e, props.requirements);
                break;

            case 'radio':
                handleRadioForms(e, props.requirements);
                break;

            case 'input-checkbox':
                handleInputCheckboxForms(e, props.requirements);
                break;

            case 'file':
                handleFileForms(e, props.requirements);
                break;
                
            default:
                break;
        }
    }

    return (
        buildContent()
    )
}

export default Form;
