import React from "react";

const Comp = ({ session, packageName, path, filename }) => {

    const [fileuploadresult, setFileuploadresult] = React.useState();
    const [restartresult, setRestartresult] = React.useState();

    const restart = async () => {
        const res = JSON.parse(await session.call("restartPackage.dappmanager.dnp.dappnode.eth", [],
            {
                id: packageName,
            }));
        if (res.success === true) {
            setRestartresult("restarting package - wait a few minutes and reload this page");
        }
    }


    function fileToDataUri(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {
                // fileContent is a base64 URI = data:application/zip;base64,UEsDBBQAAAg...
                const fileContent = e.target.result;
                resolve(fileContent);
            };
        });
    }

    async function uploadFile(file, path, name, setMsg) {
        try {
            const dataUri = await fileToDataUri(file);
            const res = JSON.parse(await session.call("copyFileTo.dappmanager.dnp.dappnode.eth", [],
                {
                    id: packageName,
                    dataUri: dataUri,
                    filename: name,
                    toPath: path
                }));
            setMsg(res.message);
        } catch (e) {
            console.error(`Error on copyFileTo ${packageName} ${path}/${name}: ${e.stack}`);
        }
    }

    return (
        <>
            <div>
                {filename} &nbsp;
            <input
                    type="file"
                    onChange={e => uploadFile(e.target.files[0], path, filename, setFileuploadresult)}
                />
                {fileuploadresult && (<div className="is-size-7">{fileuploadresult}</div>)}
            </div>


            {fileuploadresult && (
                <>
                    <button className="button" onClick={restart}>restart node</button>
                    {restartresult && (<div className="is-size-7">{restartresult}</div>)}
                </>
            )}
        </>
    );

}

export default Comp;