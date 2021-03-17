import React from "react";
// import spinner from "../../../assets/spinner.svg";
// import checkmark from "../../../assets/green-checkmark-line.svg";
import axios from "axios";
import "./SwarmInfo.css";
import DownloadBackup from "./DownloadBackup";
import RestoreBackup from "./RestoreBackup";
// import { getChequeubookBalance } from "@ethersphere/bee-js/dist/modules/debug/chequebook";
// import { getLastCheques } from "@ethersphere/bee-js/dist/modules/debug/chequebook";

const endpoint = "http://bee.avadopackage.com:81";
const packageName = "bee.avado.dnp.dappnode.eth";


function dataUriToBlob(dataURI) {
    if (!dataURI || typeof dataURI !== "string")
        throw Error("dataUri must be a string");
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return blob;
}

const Comp = ({ session }) => {
    const [chequebookAddress, setChequebookAddress] = React.useState();
    const [cheques, setCheques] = React.useState([]);
    const [tab, setTab] = React.useState("backup");


    const getPeers = () => {
        return axios.get(`${endpoint}/chequebook/cheque`, {
        }).then((resCheques) => {
            if (!resCheques.data.lastcheques) {
                return [];
            }
            const peers = resCheques.data.lastcheques.map((c) => { return c.peer });
            return peers;
        });
    };

    const getCumulativePayout = (peer) => {
        return axios.get(`${endpoint}/chequebook/cheque/${peer}`, {
        }).then((resCheques) => {
            if (!resCheques.data.lastreceived || !resCheques.data.lastreceived.payout) {
                return 0;
            }
            return parseFloat(resCheques.data.lastreceived.payout);
        });
    };

    const getLastCashedPayout = (peer) => {
        return axios.get(`${endpoint}/chequebook/cashout/${peer}`, {
        }).then((res) => {
            if (!res.data.cumulativePayout) {
                return 0;
            }
            return res.data.cumulativePayout;
        }).catch((err) => {
            if (err.response.data.message === "no prior cheque")  {
                return 0;
            }  
        });
    }

    const getUncashedAmount = async (peer) => {
        const cumulativePayout = await getCumulativePayout(peer);
        if (cumulativePayout === 0) {
            return 0;
        }
        const cashedPayout = await getLastCashedPayout(peer);
        return cumulativePayout - cashedPayout;
    }

    const getCheques = async () => {
        const peers = await getPeers();
        const list = await peers.reduce(async (accump, peer) => {
            const accum = await accump;
            const amount = await getUncashedAmount(peer)
            if (amount > 0) {
                accum.push({
                    amount: amount,
                    peer: peer
                });
            }
            return accum;
        }, Promise.resolve([]));
        setCheques(list);
    }



    React.useEffect(() => {
        axios.get(`${endpoint}/chequebook/address`, {
        }).then((res) => {
            setChequebookAddress(res.data.address);
        });
        getCheques();
        const timer = setInterval(() => { getCheques() }, 60 * 1000);
        return (() => { clearInterval(timer) })
    },[]);





    React.useEffect(() => {
        if (!session) return;
        async function downloadFile(packageName, fromPath) {
            try {
                const res = JSON.parse(await session.call("copyFileFrom.dappmanager.dnp.dappnode.eth", [],
                    {
                        id: packageName,
                        fromPath: fromPath
                    }
                ));
                if (res.success !== true) return;
                const dataUri = res.result;
                if (!dataUri) return;
                const data = await dataUriToBlob(dataUri).text();
                const wallet = JSON.parse(data);
                setChequebookAddress(wallet.address);
            } catch (e) {
                console.error(`Error on copyFileFrom ${fromPath}: ${e.stack}`);
            }
        }
        downloadFile(packageName, "/home/bee/.bee/keys/swarm.key");
    }, [session]);


    const payoutAll = async (cheques) => {
        // debugger;
        if (cheques) {
            for (let i = 0; i < cheques.length; i++) {
                // if (cheques[i].lastreceived && cheques.lastcheques[i].peer) {
                // console.log("Payout",cheques.lastcheques[i]);
                await payout(cheques[i].peer);
                // }
            }
        }
    }

    const payout = async (peer) => {
        console.log("payout", peer);
        await axios.post(`${endpoint}/chequebook/cashout/${peer}`, {
        }).then((res) => {
            console.log(res.data);
            // getCheques();
        })
    }

    let chequesList = cheques ? cheques.reduce((accum, cheque, i) => {
        const p = parseFloat(cheque.amount) / 10e15;
        accum.push(
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{p}</td>
                <td>{cheque.peer}</td>
                <td><div className="is-underline" onClick={(e) => { payout(cheque.peer); }}>Claim cheque</div></td>
            </tr>
        )
        return accum;
    }, []) : [];

    if (chequesList && chequesList.length > 0) {
        chequesList
            .push(
                (
                    <tr key="all">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><div className="is-underline" onClick={async (e) => {
                            payoutAll(cheques);
                            getCheques();
                        }}>Claim All</div></td>
                    </tr>
                )
            )
    }

    return (
        <>

            <h3 className="is-size-3 has-text-white">Token Faucet</h3>
            <section className="is-medium has-text-white">
                <a rel="noopener noreferrer" target="_blank" className="button" href={`https://bzz.ethswarm.org/?transaction=buy&amount=1&slippage=30&receiver=0x${chequebookAddress}`}>get G-ETH and gBZZ tokens</a>
            </section>
            <section className="setting is-medium has-text-white">
                <h3 className="is-size-3 has-text-white">Node status</h3>
                <table className="table-profile">
                    <tbody><tr>
                        <th colSpan="1"></th>
                        <th colSpan="2"></th>
                    </tr>
                        <tr>
                            <td>Chequebook address</td>
                            <td>{chequebookAddress ? (
                                <a rel="noopener noreferrer" alt="Click to show account on the Goerli block explorer" target="_blank" href={`https://goerli.etherscan.io/address/0x${chequebookAddress}`}>0x{chequebookAddress}</a>
                            ) : "  ..loading"}</td>
                        </tr>
                    </tbody></table>
            </section>
            <section className="setting is-medium has-text-white">

                <h3 className="is-size-3 has-text-white">Unclaimed Cheques</h3>
                {chequesList && chequesList.length > 0 ? (
                    <>
                        <table className="table-profile">
                            <thead><tr>
                                <td className="has-text-weight-bold has-text-white" >#</td>
                                <td className="has-text-weight-bold has-text-white" >Payout (gBZZ)</td>
                                <td className="has-text-weight-bold has-text-white">From peer</td>
                                <td className="has-text-weight-bold has-text-white">Action</td>
                            </tr>
                            </thead>
                            <tbody>
                                {chequesList}
                            </tbody></table>
                    </>
                ) : (
                        <div>No unclaimed cheques right now... Please wait a while</div>
                    )}
                <br />
            </section>
            <section className="setting is-medium has-text-white">
                <div className="columns">
                    <div className="column is-half">
                        <nav className="panel is-half">
                            <p className="panel-heading">Backup and Restore</p>
                            <p className="panel-tabs">
                                <a className={`${tab === "backup" ? "is-active  has-text-weight-bold" : ""} has-text-white`} onClick={() => { setTab("backup") }} >Backup</a>
                                <a className={`${tab === "restore" ? "is-active has-text-weight-bold" : ""} has-text-white`} onClick={() => { setTab("restore") }} >Restore</a>
                            </p>
                            <div className="panel-block">
                                {tab === "backup" && (
                                    <section className="is-medium has-text-white">
                                        <p className="">You can download your node keys. this is very important because it contains the wallet that holds your chequebook.</p>
                                        <DownloadBackup fileprefix={chequebookAddress} path={"/home/bee/.bee/keys"} packageName={packageName} session={session} />
                                    </section>
                                )}
                                {tab === "restore" && (
                                    <section className="is-medium has-text-white">
                                        <p className="">Here you can upload your chequebook key. If you want to restore your chequebook  from a previous installation.</p>
                                        <RestoreBackup session={session} path={"/home/bee/.bee/keys"} filename={"swarm.key"} packageName={packageName} />
                                    </section>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </section>
            <a href="http://my.avado/#/Packages/bee.avado.dnp.dappnode.eth/detail" rel="noopener noreferrer" target="_blank">show node logs</a>

        </>);
};

export default Comp;
