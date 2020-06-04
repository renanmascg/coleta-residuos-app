import React, { useEffect, useState, ChangeEvent } from 'react';
import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css'

interface Item {
  id: number;
  title:string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla:string
}

interface IBGECityResponse {
  nome:string
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUf] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([])

  const [selectedUF, setSelectedUF] = useState<string>('0');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  // Carregar todas as UFs existentes no BR
  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUf(ufInitials);
    })
  }, []);

  // RODA APOS A MUDANÇA DE UF
  useEffect(() => {
    if(selectedUF === '0') return;

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(response => {
        const citiesNames = response.data.map(city => city.nome);

        setCities(citiesNames);
      })

  }, [selectedUF])

  // Carregar todas as cidades quando a UF mudar
  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat, 
      event.latlng.lng,
    ]);
  }

  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta"/>

        <Link to='/'>
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form>
        <h1>Cadastro do <br/> Ponto de Coleta</h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text" 
              name='name'
              id='name'
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name='email'
                id='email'
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text" 
                name='whatsapp'
                id='whatsapp'
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o Endereço no mapa</span>
          </legend>

          <Map center={[-23.6641927, -46.7768741]} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>

              <select 
                name="uf" 
                id="uf" 
                onChange={handleSelectUF}
                value={selectedUF}
              >
                <option value='0'>Selecione uma UF</option>
                {
                  ufs.map(uf => {
                    return (
                      <option key={uf} value={uf}>{uf}</option>
                    )
                  })
                }
              </select>
              
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value='0'>Selecione uma Cidade</option>
                {
                  cities.map(city => {
                    return (
                      <option key={city} value={city}>{city}</option>
                    )
                  })
                }
              </select>
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {
              items.map(item => {
                return (
                  <li>
                    <img src={item.image_url} alt={item.title} key={item.id}/>
                    <span>{ item.title}</span>
                  </li>
                )
              })
            }
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar Ponto de Coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;