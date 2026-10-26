import Head from "next/head";
import { useMemo, useState } from "react";
import { Web3 } from "web3";

const ADDR = {
  poster: "0x8dCb41B34f56297BC311E5376c4599983d857c58",
  token: "0x6b5ADc5E76256cCB67f07764b59FDCC748876307",
  gated: "0x992d976Cf778312A4Fde8fD4c1174492a58f8FDE"
};
const POSTER_ABI = [
  { anonymous:false, inputs:[{indexed:true,name:"user",type:"address"},{indexed:false,name:"content",type:"string"},{indexed:true,name:"tag",type:"string"}], name:"NewPost", type:"event" },
  { inputs:[{name:"content",type:"string"},{name:"tag",type:"string"}], name:"post", outputs:[], stateMutability:"nonpayable", type:"function" }
];
const TOKEN_ABI = [
  { inputs:[{name:"account",type:"address"}], name:"balanceOf", outputs:[{type:"uint256"}], stateMutability:"view", type:"function" },
  { inputs:[{name:"to",type:"address"},{name:"amount",type:"uint256"}], name:"transfer", outputs:[{type:"bool"}], stateMutability:"nonpayable", type:"function" },
  { inputs:[{name:"recipient",type:"address"},{name:"amount",type:"uint256"}], name:"mint", outputs:[], stateMutability:"nonpayable", type:"function" },
  { inputs:[], name:"owner", outputs:[{type:"address"}], stateMutability:"view", type:"function" }
];
const GATED_ABI = [...POSTER_ABI,
  { inputs:[], name:"tokenAddress", outputs:[{type:"address"}], stateMutability:"view", type:"function" },
  { inputs:[], name:"threshold", outputs:[{type:"uint256"}], stateMutability:"view", type:"function" }
];

export default function Home() {
  const [web3,setWeb3]=useState(); const [account,setAccount]=useState(""); const [status,setStatus]=useState("Кошелёк не подключён");
  const [content,setContent]=useState(""); const [tag,setTag]=useState("lab2"); const [posts,setPosts]=useState([]); const [filter,setFilter]=useState("");
  const [balance,setBalance]=useState("—"); const [recipient,setRecipient]=useState(""); const [amount,setAmount]=useState("1");
  const [gatedContent,setGatedContent]=useState(""); const [gatedTag,setGatedTag]=useState("lab4"); const [gate,setGate]=useState("Проверка не выполнена");
  const poster=useMemo(()=>web3&&new web3.eth.Contract(POSTER_ABI,ADDR.poster),[web3]);
  const token=useMemo(()=>web3&&new web3.eth.Contract(TOKEN_ABI,ADDR.token),[web3]);
  const gated=useMemo(()=>web3&&new web3.eth.Contract(GATED_ABI,ADDR.gated),[web3]);

  async function connect(){
    if(!window.ethereum){setStatus("MetaMask не найден");return;}
    await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xaa36a7"}]}).catch(async e=>{if(e.code===4902)await window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:"0xaa36a7",chainName:"Ethereum Sepolia",nativeCurrency:{name:"SepoliaETH",symbol:"ETH",decimals:18},rpcUrls:["https://ethereum-sepolia-rpc.publicnode.com"],blockExplorerUrls:["https://sepolia.etherscan.io"]}]});else throw e;});
    const w=new Web3(window.ethereum); const [a]=await window.ethereum.request({method:"eth_requestAccounts"}); setWeb3(w); setAccount(a); setStatus("MetaMask подключён к Sepolia");
  }
  async function refreshPosts(){const events=await poster.getPastEvents("NewPost",{fromBlock:11997900,toBlock:"latest"});setPosts(events.map(e=>({user:e.returnValues.user,content:e.returnValues.content,tagHash:e.returnValues.tag})));}
  async function publish(){setStatus("Подтвердите публикацию в MetaMask");await poster.methods.post(content,tag).send({from:account});setStatus("Сообщение опубликовано");await refreshPosts();}
  async function refreshBalance(){const v=await token.methods.balanceOf(account).call();setBalance(web3.utils.fromWei(v,"ether"));const t=await gated.methods.threshold().call();setGate(`${web3.utils.fromWei(v,"ether")} SLT / требуется ${web3.utils.fromWei(t,"ether")} SLT`);}
  async function transfer(){await token.methods.transfer(recipient,web3.utils.toWei(amount,"ether")).send({from:account});await refreshBalance();setStatus("Перевод SLT подтверждён");}
  async function mint(){await token.methods.mint(recipient||account,web3.utils.toWei(amount,"ether")).send({from:account});await refreshBalance();setStatus("Чеканка SLT подтверждена");}
  async function addToken(){await window.ethereum.request({method:"wallet_watchAsset",params:{type:"ERC20",options:{address:ADDR.token,symbol:"SLT",decimals:18}}});}
  async function gatedPost(){await refreshBalance();setStatus("Подтвердите token-gated публикацию");await gated.methods.post(gatedContent,gatedTag).send({from:account});setStatus("Token-gated публикация подтверждена");}
  return <><Head><title>Лабораторные работы Web3</title></Head><main>
    <header><div><span className="eyebrow">Ethereum Sepolia · Chain ID 11155111</span><h1>Лабораторный Web3 стенд</h1><p>Poster, ERC‑20 и token‑gating в одном интерфейсе</p></div><button className="primary" onClick={connect}>{account?`${account.slice(0,6)}…${account.slice(-4)}`:"Подключить MetaMask"}</button></header>
    <div className="status">{status}</div>
    <section id="lab2"><div className="num">02</div><div className="body"><h2>Гостевая книга Poster</h2><p className="muted">Адрес {ADDR.poster}</p><div className="grid"><input placeholder="Текст сообщения" value={content} onChange={e=>setContent(e.target.value)}/><input placeholder="Тег" value={tag} onChange={e=>setTag(e.target.value)}/></div><div className="actions"><button onClick={publish} disabled={!account||!content}>Опубликовать</button><button className="ghost" onClick={refreshPosts} disabled={!account}>Обновить записи</button><input className="small" placeholder="Фильтр по тегу" value={filter} onChange={e=>setFilter(e.target.value)}/></div><div className="posts">{posts.filter(p=>!filter||(web3&&p.tagHash.toLowerCase()===web3.utils.keccak256(filter).toLowerCase())).map((p,i)=><article key={i}><b>{p.content}</b><small>{p.user}</small></article>)}</div></div></section>
    <section id="lab3"><div className="num">03</div><div className="body"><h2>Токен Student Lab Token</h2><p className="muted">SLT · {ADDR.token}</p><div className="metric"><span>Баланс MetaMask</span><strong>{balance} SLT</strong></div><div className="grid"><input placeholder="Адрес получателя" value={recipient} onChange={e=>setRecipient(e.target.value)}/><input placeholder="Количество" value={amount} onChange={e=>setAmount(e.target.value)}/></div><div className="actions"><button onClick={refreshBalance} disabled={!account}>Проверить баланс</button><button onClick={transfer} disabled={!account||!recipient}>Перевести</button><button onClick={mint} disabled={!account}>Выпустить</button><button className="ghost" onClick={addToken} disabled={!account}>Добавить SLT в MetaMask</button></div></div></section>
    <section id="lab4"><div className="num">04</div><div className="body"><h2>Token‑gated Poster</h2><p className="muted">Публикация разрешена при балансе не менее 10 SLT</p><div className="metric"><span>Проверка доступа</span><strong>{gate}</strong></div><div className="grid"><input placeholder="Закрытое сообщение" value={gatedContent} onChange={e=>setGatedContent(e.target.value)}/><input placeholder="Тег" value={gatedTag} onChange={e=>setGatedTag(e.target.value)}/></div><div className="actions"><button onClick={refreshBalance} disabled={!account}>Проверить доступ</button><button onClick={gatedPost} disabled={!account||!gatedContent}>Опубликовать</button></div></div></section>
  </main></>;
}

