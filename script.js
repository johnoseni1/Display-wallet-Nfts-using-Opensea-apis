import { ethers } from "https://cdn.skypack.dev/ethers"

const connect = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()
      const accountAddress = await signer.getAddress()

      document.getElementById("wallet_address").innerText = accountAddress
      document.getElementById("wallet_address").removeAttribute("hidden")

      resolve(accountAddress)
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

const renderTokensForOwner = (ownerAddress) => {
  fetch(
    `https://api.opensea.io/api/v1/assets?owner=${ownerAddress}&order_direction=desc&offset=0&limit=30`,
    { method: "GET", headers: { Accept: "application/json" } }
  ).then(response => response.json()).then(({ assets }) => {
    assets.forEach((attributes) => {
      document.getElementById("container").append(createTokenElement(attributes))
    })
  })
}

const createTokenElement = ({ name, collection, description, permalink, image_preview_url, token_id }) => {
  const newElement = document.getElementById("nft_template").content.cloneNode(true)

  newElement.querySelector("section").id = `${collection.slug}_${token_id}`
  newElement.querySelector("h1").innerText = name
  newElement.querySelector("a").href = permalink
  newElement.querySelector("img").src = image_preview_url
  newElement.querySelector("img").alt = description

  return newElement
}

document.addEventListener("DOMContentLoaded", async () => {
  let accountAddress

  accountAddress = await connect()
  renderTokensForOwner(accountAddress)

  window.ethereum.on("accountsChanged", async () => {
    accountAddress = await connect()
    document.getElementById("container").innerHTML = ""
    renderTokensForOwner(accountAddress)
  })
})
