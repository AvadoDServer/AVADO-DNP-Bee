import React from "react";
// import spinner from "../../../assets/spinner.svg";
// import checkmark from "../../../assets/green-checkmark-line.svg";
import axios from "axios";
import { Bee } from "@ethersphere/bee-js"; // Connect to a node const

const endpoint = "http://bee.avadopackage.com:81";

const bee = new Bee(endpoint);

const Comp = ({ session }) => {
    // React.useEffect(async () => {

    //     const topic = "CATVADO";
    //     const addresses = (await axios.get(`${endpoint}/addresses`)).data;
    //     debugger;
    //     const feedTemplateURL = `${endpoint}/bzz-feed:/?topic=${topic}&user=${addresses.ethereum}&meta=1`;
    //     debugger;
    //     const feedTemplate = (await axios.get(`${feedTemplateURL}`)).data;
    //     debugger;

    // });


    const [catURL, setCatURL] = React.useState()

    // const getACat = async () => {
    //     const cat = await axios.get(`https://api.thecatapi.com/v1/images/search`, {
    //         headers: {
    //             'x-api-key': '7d3531b1-18dc-40f9-a94d-15769e6a09f6'
    //         }
    //     });
    //     if (cat && cat.data && cat.data[0] && cat.data[0].url) {
    //         return cat.data[0].url;
    //         // setCatURL(cat.data[0].url);
    //     }
    //     return null;
    //     // debugger;
    // }

    const uploadURL = (url) => {
        axios.get(`https://cataas.com/cat?${Math.random()}`,
            {
                responseType: 'arraybuffer',
                // headers: {
                //     'Content-Type': 'application/json',
                //     'Accept': 'application/pdf'
                // }
            })
            .then(async (response) => {
                 debugger;


                //  const fileHash = await bee.uploadData(response.data);
                 const fileHash = await bee.uploadData("test");
                 console.log(fileHash);
                debugger;
                const retrievedData = await bee.downloadData(fileHash);
                debugger;
                const url = window.URL.createObjectURL(new Blob([retrievedData]));
                setCatURL(url);

                // debugger;
                // const link = document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', 'file.pdf'); //or any other extension
                // document.body.appendChild(link);
                // link.click();
            })
            .catch((error) => console.log(error));
    }

    // const ws = bee.pssSubscribe("AVADO",(ev)=>{
    //     debugger;
    //     const receivedMessage = Buffer.from(ev.data).toString()
    // })

    // bee.pssSend("AVADO","9844d731c38923f715f157ae9af63406fa7e77240425dba9327a2c5b0918bdd2","quaak");


    // feeds


    // ws.onmessage = ev => {
    //   const receivedMessage = Buffer.from(ev.data).toString()

    //   // ignore empty messages
    //   if (receivedMessage.length === 0) {
    //     return
    //   }
    //   ws.terminate()
    //   expect(receivedMessage).toEqual(message)
    //   done()
    // }

    // debugger;

    // const up =  async ()  => {

    //     const fileHash = await bee.uploadData("Bee is awesome!");
    //     const retrievedData = await bee.downloadData(fileHash);

    //     console.log(retrievedData.toString()); // prints 'Bee is awesome!'        
    // }

    // up();

    // }, []);

    return (
        <>
            <h3 className="is-size-3 has-text-white"><button onClick={async () => {
                uploadURL(catURL);
            }}>Send A Cat</button></h3>
            {catURL && (
                <figure class="image is-128x128">
                    <img src={catURL} />
                </figure>
            )}
        </>);
};

export default Comp;
