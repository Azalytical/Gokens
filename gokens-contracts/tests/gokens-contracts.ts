import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GokensContracts } from "../target/types/gokens_contracts";
import { assert } from "chai";

// Token Program ID константа
const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

describe("gokens-contracts", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GokensContracts as Program<GokensContracts>;

  it("Creates an art collection", async () => {
    // Generate a new keypair for the collection
    const collection = anchor.web3.Keypair.generate();
    
    // Create the collection
    const tx = await program.methods
      .createArtCollection(
        "Gokens Art Collection",
        "GART",
        "https://example.com/collection.json"
      )
      .accounts({
        collection: collection.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([collection])
      .rpc();
      
    console.log("Collection created with transaction:", tx);
    
    // Fetch the collection account
    const collectionAccount = await program.account.artCollection.fetch(collection.publicKey);
    
    assert.equal(collectionAccount.name, "Gokens Art Collection");
    assert.equal(collectionAccount.symbol, "GART");
    assert.equal(collectionAccount.totalSupply.toNumber(), 0);
    assert.equal(collectionAccount.isActive, true);
  });

  it("Mints an art NFT", async () => {
    // First create a collection
    const collection = anchor.web3.Keypair.generate();
    
    await program.methods
      .createArtCollection(
        "Test Collection",
        "TEST",
        "https://example.com/collection.json"
      )
      .accounts({
        collection: collection.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([collection])
      .rpc();
    
    // Now mint an NFT
    const nft = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    
    const tx = await program.methods
      .mintArtNft(
        "Mona Lisa Digital",
        "A digital representation of the famous painting",
        "https://example.com/monalisa.json",
        new anchor.BN(1000000000), // 1 SOL in lamports
        10 // 10% royalty
      )
      .accounts({
        nft: nft.publicKey,
        collection: collection.publicKey,
        mint: mint.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([nft])
      .rpc();
      
    console.log("NFT minted with transaction:", tx);
    
    // Verify the NFT was created correctly
    const nftAccount = await program.account.artNft.fetch(nft.publicKey);
    assert.equal(nftAccount.name, "Mona Lisa Digital");
    assert.equal(nftAccount.royaltyPercentage, 10);
  });

  it("Creates fractional tokens for art", async () => {
    // Setup: Create collection and NFT first
    const collection = anchor.web3.Keypair.generate();
    const nft = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    
    // Create collection
    await program.methods
      .createArtCollection("Fractional Collection", "FRAC", "https://example.com/collection.json")
      .accounts({
        collection: collection.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([collection])
      .rpc();
    
    // Mint NFT
    await program.methods
      .mintArtNft(
        "Expensive Artwork",
        "Very valuable art piece",
        "https://example.com/artwork.json",
        new anchor.BN(100000000000), // 100 SOL
        5
      )
      .accounts({
        nft: nft.publicKey,
        collection: collection.publicKey,
        mint: mint.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([nft])
      .rpc();
    
    // Create fractional tokens
    const fractionalArt = anchor.web3.Keypair.generate();
    const tokenMint = anchor.web3.Keypair.generate();
    
    const tx = await program.methods
      .createFractionalTokens(
        new anchor.BN(1000), // 1000 shares
        new anchor.BN(100000000) // 0.1 SOL per share
      )
      .accounts({
        fractionalArt: fractionalArt.publicKey,
        nft: nft.publicKey,
        tokenMint: tokenMint.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([fractionalArt])
      .rpc();
      
    console.log("Fractional tokens created:", tx);
    
    // Verify fractional account
    const fractionalAccount = await program.account.fractionalArt.fetch(fractionalArt.publicKey);
    assert.equal(fractionalAccount.totalShares.toNumber(), 1000);
    assert.equal(fractionalAccount.availableShares.toNumber(), 1000);
    assert.equal(fractionalAccount.isActive, true);
  });
});