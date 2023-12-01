

const ArtGuardContract = artifacts.require("ArtGuard")

module.exports = function (deployer) {
    deployer.deploy(ArtGuardContract)
}