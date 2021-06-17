import { bagListManager, addItemToList, format_date, init_web3, bagPartListManager, getMultipleActivePart, getActivePart, clearBagDetails, getOwnerHistoryFromEvents, getOwnedItemsFromEvent } from "./utils.js"



window.onload = async function () {

    var x = await init_web3()

    // document.getElementById("register-part").addEventListener("click", function () {
    //     console.log("Register Received Part")

    //     var addr = document.getElementById("part-addr").value

    //     if(addr != ""){
    //         addItemToList(addr, "bag-part-list", bagPartListManager)
    //     }
    // })

    //Get all the parts that belonged to this factory and then check the ones that still do
    var parts = await getOwnedItemsFromEvent(window.accounts[0], 'TransferPartOwnership')
    console.log(parts)
    for (var i = 0; i < parts.length; i++) {
        var owners = await getOwnerHistoryFromEvents('TransferPartOwnership', parts[i])
        console.log(owners)
        if (owners[owners.length - 1] == window.accounts[0]) {
            addItemToList(parts[i], "bag-part-list", bagPartListManager)
        }
    }

    document.getElementById("build-bag").addEventListener("click", function () {
        console.log("Build Bag")

        //First, get the serial number
        var serial = document.getElementById("create-bag-serial-number").value
        if (serial != "") {
            //Then the parts that will be present on the bag
            var part_list = getMultipleActivePart()
            var part_array = []
            for (var i = 0; i < part_list.length; i++) {
                part_array.push(part_list[i].textContent)
            }

            // //Fill part array with dummy elements for the unprovided parts
            // while(part_array.length < 6){
            //     part_array.push("0x0")
            // }
            var creation_date = format_date()

            console.log("Create bag with params")
            console.log(serial)
            console.log(part_array)
            console.log(creation_date)
            //Finally, build the bag
            window.pm.methods.buildProduct(serial, "Bag", creation_date, part_array).send({ from: window.accounts[0], gas: 2000000 }, function (error, result) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Bag created")
                    //Add hash to bag owned list
                    var bag_sha = web3.utils.soliditySha3(window.accounts[0], web3.utils.fromAscii(serial),
                        web3.utils.fromAscii("Bag"), web3.utils.fromAscii(creation_date))
                    addItemToList(bag_sha, "bag-list", bagListManager)

                    //Remove parts from available list
                    for (var i = 0; i < part_list.length; i++) {
                        part_list[i].removeEventListener("click", bagPartListManager)
                        part_list[i].parentElement.removeChild(part_list[i])
                    }
                }
            })
        }
    })

    document.getElementById("bag-change-ownership-btn").addEventListener("click", function () {
        console.log("Change Ownership")
        //Get bag hash from active item on owned list

        var hash_element = getActivePart("bag-list")
        if (hash_element != undefined) {
            var to_address = document.getElementById("bag-change-ownership-input").value
            if (to_address != "") {
                window.co.methods.changeOwnership(1, hash_element.textContent, to_address).send({ from: window.accounts[0], gas: 100000 }, function (error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("Changed ownership")
                        //Logic to remove item from owned list
                        hash_element.parentElement.removeChild(hash_element)
                        clearCarDetails()
                    }
                })
            }

        }
    })
}
