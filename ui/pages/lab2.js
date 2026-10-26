import Head from "next/head";
import {useMemo,useState} from "react";
import {Web3} from "web3";
const ADDRESS="0x8dCb41B34f56297BC311E5376c4599983d857c58";
const ABI=[{anonymous:false,inputs:[{indexed:true,name:"user",type:"address"},{indexed:false,name:"content",type:"string"},{indexed:true,name:"tag",type:"string"}],name:"NewPost",type:"event"},{inputs:[{name:"content",type:"string"},{name:"tag",type:"string"}],name:"post",outputs:[],stateMutability:"nonpayable",type:"function"}];
export default function Lab2(){
 const [web3,setWeb3]=useState();const [account,setAccount]=useState("");const [content,setContent]=useState("");const [tag,setTag]=useState("lab2");const [filter,setFilter]=useState("");const [posts,setPosts]=useState([]);const [status,setStatus]=useState("Ожидание подключения MetaMask");
 const contract=useMemo(()=>web3&&new web3.eth.Contract(ABI,ADDRESS),[web3]);
 async function connect(){const w=new Web3(window.ethereum);await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xaa36a7"}]});const [a]=await window.ethereum.request({method:"eth_requestAccounts"});setWeb3(w);setAccount(a);setStatus("MetaMask подключён к Sepolia");}
 async function load(){const e=await contract.getPastEvents("NewPost",{fromBlock:11997900,toBlock:"latest"});setPosts(e.map(x=>x.returnValues));}
 async function post(){await contract.methods.post(content,tag).send({from:account});setStatus("Публикация подтверждена");await load();}
 const visible=posts.filter(p=>!filter||p.tag.toLowerCase()===web3.utils.keccak256(filter).toLowerCase());
 return <><Head><title>Лабораторная работа 2 Poster</title></Head><main><header><div><span className="eyebrow">ЛАБОРАТОРНАЯ РАБОТА 2 · ETHEREUM SEPOLIA</span><h1>Гостевая книга Poster</h1><p>Публикация сообщений и фильтрация событий по тегу</p></div><button className="primary" onClick={connect}>{account?`${account.slice(0,6)}…${account.slice(-4)}`:"Подключить MetaMask"}</button></header><div className="status">{status}</div><section><div className="num">02</div><div className="body"><h2>Новая запись</h2><p className="muted">Контракт Poster · {ADDRESS}</p><div className="grid"><input placeholder="Текст сообщения" value={content} onChange={e=>setContent(e.target.value)}/><input placeholder="Тег" value={tag} onChange={e=>setTag(e.target.value)}/></div><div className="actions"><button disabled={!account||!content} onClick={post}>Опубликовать</button><button className="ghost" disabled={!account} onClick={load}>Загрузить события</button><input className="small" placeholder="Фильтр по тегу" value={filter} onChange={e=>setFilter(e.target.value)}/></div><div className="posts">{visible.map((p,i)=><article key={i}><b>{p.content}</b><small>{p.user}</small></article>)}</div></div></section></main></>;
}
