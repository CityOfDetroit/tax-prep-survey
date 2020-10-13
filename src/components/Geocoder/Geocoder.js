import React, { useState }from 'react';
import './Geocoder.scss';

function Geocoder(props) {
  // Declare a new state variable, which we'll call when changing panel render
  const [sugg, setSugg]       = useState();
  const [address, setAddress] = useState();
  const [parcel, setParcel]   = useState(props.parcel);

  const getAddressSuggestions = (addr) => {
    let tempAddr = addr.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${newTempAddr}&category=&outFields=User_fld&maxLocations=4&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json`;
    
    try {
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            setSugg(data.candidates);
        })
        .catch((error) => {
            error(error);
        });
    }catch (error) {
        console.log(error);
    }
  }

  const handleChange = (ev) => {
      getAddressSuggestions(ev.target.value);
      (ev.target.value == '') ? setAddress('') : setAddress(ev.target.value);
      if(sugg != undefined){
        sugg.forEach((item) => {
          if(ev.target.value == item.address){
            setParcel(item.attributes.User_fld);
          }
        })
      }
  }

  const buildOptions = () => {
    const markup = sugg.map((item, key) =>
        <option key={key} value={item.address} data-parcel={item.attributes.User_fld}></option>
    );
    return markup;
  }

  const buildNames = () => {
    return `${props.id}-list`;
  }

  const getClassName = () => {
    if(props.required){
      return 'required-field';
    }else{
      return '';
    }
  }

  return (
      <div>
        <label className={getClassName()} htmlFor={props.id}>{props.label}</label>
        <input list={buildNames()} id={props.id} aria-label={props.label} name={props.name} value={props.value} defaultValue={props.savedValue} placeholder={props.placeholder} data-parcel={parcel} onChange={handleChange} aria-required={props.required} required={props.required} autoComplete="off"></input>
        <datalist id={buildNames()}>
            {(sugg) ? buildOptions() : ''}
        </datalist>
      </div>
  );
}

export default Geocoder;
