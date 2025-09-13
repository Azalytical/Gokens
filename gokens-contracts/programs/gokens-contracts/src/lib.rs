use anchor_lang::prelude::*;
use anchor_spl::token::Token;

declare_id!("FeLQB1uPtHA7wfq2m1uBHxd4SL8G5H37S9LbTEh5DmRh");

#[program]
pub mod gokens_contracts {
    use super::*;

    // Создание NFT коллекции для искусства
    pub fn create_art_collection(
        ctx: Context<CreateArtCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        collection.authority = ctx.accounts.authority.key();
        collection.name = name;
        collection.symbol = symbol;
        collection.uri = uri;
        collection.total_supply = 0;
        collection.is_active = true;
        
        msg!("Art collection created: {}", collection.name);
        Ok(())
    }

    // Минтинг NFT произведения искусства
    pub fn mint_art_nft(
        ctx: Context<MintArtNFT>,
        name: String,
        description: String,
        uri: String,
        price: u64,
        royalty_percentage: u8,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        let collection = &mut ctx.accounts.collection;
        
        // Проверяем, что коллекция активна
        require!(collection.is_active, ErrorCode::CollectionNotActive);
        
        nft.mint = ctx.accounts.mint.key();
        nft.owner = ctx.accounts.owner.key();
        nft.collection = collection.key();
        nft.name = name;
        nft.description = description;
        nft.uri = uri;
        nft.price = price;
        nft.royalty_percentage = royalty_percentage;
        nft.creator = ctx.accounts.owner.key();
        nft.is_listed = false;
        
        // Увеличиваем общее количество в коллекции
        collection.total_supply += 1;
        
        msg!("NFT minted: {}", nft.name);
        Ok(())
    }

    // Создание фракционных токенов для произведения искусства
    pub fn create_fractional_tokens(
        ctx: Context<CreateFractionalTokens>,
        total_shares: u64,
        price_per_share: u64,
    ) -> Result<()> {
        let fractional = &mut ctx.accounts.fractional_art;
        
        fractional.nft = ctx.accounts.nft.key();
        fractional.total_shares = total_shares;
        fractional.available_shares = total_shares;
        fractional.price_per_share = price_per_share;
        fractional.token_mint = ctx.accounts.token_mint.key();
        fractional.is_active = true;
        
        msg!("Fractional tokens created: {} shares at {} each", total_shares, price_per_share);
        Ok(())
    }

    // Покупка фракционной доли
    pub fn buy_fractional_share(
        ctx: Context<BuyFractionalShare>,
        amount: u64,
    ) -> Result<()> {
        let fractional = &mut ctx.accounts.fractional_art;
        
        // Проверяем доступность долей
        require!(fractional.available_shares >= amount, ErrorCode::InsufficientShares);
        require!(fractional.is_active, ErrorCode::FractionalNotActive);
        
        // Обновляем доступные доли
        fractional.available_shares -= amount;
        
        // Здесь должна быть логика перевода токенов и оплаты
        // Для MVP это упрощенная версия
        
        msg!("Purchased {} fractional shares", amount);
        Ok(())
    }

    // Листинг NFT на маркетплейсе
    pub fn list_nft(
        ctx: Context<ListNFT>,
        price: u64,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        
        // Проверяем владельца
        require!(nft.owner == ctx.accounts.owner.key(), ErrorCode::NotOwner);
        
        nft.price = price;
        nft.is_listed = true;
        
        msg!("NFT listed for {} lamports", price);
        Ok(())
    }
}

// Структуры данных

#[account]
pub struct ArtCollection {
    pub authority: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub total_supply: u64,
    pub is_active: bool,
}

#[account]
pub struct ArtNFT {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub collection: Pubkey,
    pub name: String,
    pub description: String,
    pub uri: String,
    pub price: u64,
    pub royalty_percentage: u8,
    pub creator: Pubkey,
    pub is_listed: bool,
}

#[account]
pub struct FractionalArt {
    pub nft: Pubkey,
    pub total_shares: u64,
    pub available_shares: u64,
    pub price_per_share: u64,
    pub token_mint: Pubkey,
    pub is_active: bool,
}

// Контексты для инструкций

#[derive(Accounts)]
pub struct CreateArtCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 64 + 16 + 256 + 8 + 1
    )]
    pub collection: Account<'info, ArtCollection>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintArtNFT<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 32 + 128 + 256 + 256 + 8 + 1 + 32 + 1
    )]
    pub nft: Account<'info, ArtNFT>,
    #[account(mut)]
    pub collection: Account<'info, ArtCollection>,
    /// CHECK: This is the mint account
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateFractionalTokens<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 32 + 1
    )]
    pub fractional_art: Account<'info, FractionalArt>,
    pub nft: Account<'info, ArtNFT>,
    /// CHECK: Token mint for fractional shares
    pub token_mint: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyFractionalShare<'info> {
    #[account(mut)]
    pub fractional_art: Account<'info, FractionalArt>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListNFT<'info> {
    #[account(mut)]
    pub nft: Account<'info, ArtNFT>,
    pub owner: Signer<'info>,
}

// Ошибки
#[error_code]
pub enum ErrorCode {
    #[msg("Collection is not active")]
    CollectionNotActive,
    #[msg("Not the owner")]
    NotOwner,
    #[msg("Insufficient shares available")]
    InsufficientShares,
    #[msg("Fractional sale is not active")]
    FractionalNotActive,
}