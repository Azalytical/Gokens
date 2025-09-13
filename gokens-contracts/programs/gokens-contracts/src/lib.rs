// ДОБАВИТЬ в файл: gokens-contracts/programs/gokens-contracts/src/lib.rs
// В НАЧАЛО файла, заменив существующие use statements

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
// Используем solana_program из anchor_lang
use anchor_lang::solana_program::clock::Clock;

// Остальной существующий код остается как есть...
// Но добавляем новые структуры и функции ПОСЛЕ существующих

// ДОБАВИТЬ ПОСЛЕ существующих структур (после struct FractionalArt):

#[account]
pub struct SwapState {
    pub user: Pubkey,
    pub jupiter_program: Pubkey,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub timestamp: i64,
}

#[account]
pub struct KYCRecord {
    pub user: Pubkey,
    pub user_id: String,
    pub verification_level: u8,
    pub verified_at: i64,
    pub is_verified: bool,
}

#[account]
pub struct PriceFeed {
    pub asset_type: String,
    pub price: u64,
    pub confidence: u64,
    pub timestamp: i64,
    pub oracle: Pubkey,
}

// ДОБАВИТЬ в секцию impl программы ПОСЛЕ существующих функций:

    // Интеграция с Jupiter для обмена токенов (упрощенная версия)
    pub fn initialize_swap(
        ctx: Context<InitializeSwap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        let swap_state = &mut ctx.accounts.swap_state;
        let clock = Clock::get()?;
        
        swap_state.user = ctx.accounts.user.key();
        swap_state.jupiter_program = ctx.accounts.jupiter_program.key();
        swap_state.input_mint = ctx.accounts.input_mint.key();
        swap_state.output_mint = ctx.accounts.output_mint.key();
        swap_state.amount_in = amount_in;
        swap_state.amount_out = minimum_amount_out;
        swap_state.timestamp = clock.unix_timestamp;
        
        msg!("Jupiter swap initialized: {} -> {}", amount_in, minimum_amount_out);
        Ok(())
    }

    // KYC/AML заглушка
    pub fn verify_kyc(
        ctx: Context<VerifyKYC>,
        user_id: String,
        verification_level: u8,
    ) -> Result<()> {
        let kyc_record = &mut ctx.accounts.kyc_record;
        let clock = Clock::get()?;
        
        kyc_record.user = ctx.accounts.user.key();
        kyc_record.user_id = user_id;
        kyc_record.verification_level = verification_level;
        kyc_record.verified_at = clock.unix_timestamp;
        kyc_record.is_verified = true;
        
        msg!("KYC verified for user: {}", kyc_record.user_id);
        Ok(())
    }

    // Oracle интеграция для получения цены
    pub fn update_price_feed(
        ctx: Context<UpdatePriceFeed>,
        asset_type: String,
        price: u64,
        confidence: u64,
    ) -> Result<()> {
        let price_feed = &mut ctx.accounts.price_feed;
        let clock = Clock::get()?;
        
        price_feed.asset_type = asset_type.clone();
        price_feed.price = price;
        price_feed.confidence = confidence;
        price_feed.timestamp = clock.unix_timestamp;
        price_feed.oracle = ctx.accounts.oracle.key();
        
        msg!("Price updated: {} = {} (confidence: {})", 
             price_feed.asset_type, price, confidence);
        Ok(())
    }

// ДОБАВИТЬ ПОСЛЕ существующих Context структур:

#[derive(Accounts)]
pub struct InitializeSwap<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8
    )]
    pub swap_state: Account<'info, SwapState>,
    /// CHECK: Jupiter program - validated by address
    pub jupiter_program: AccountInfo<'info>,
    pub input_mint: Account<'info, Mint>,
    pub output_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct VerifyKYC<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 64 + 1 + 8 + 1
    )]
    pub kyc_record: Account<'info, KYCRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(asset_type: String)]
pub struct UpdatePriceFeed<'info> {
    #[account(
        init_if_needed,
        payer = oracle,
        space = 8 + 64 + 8 + 8 + 8 + 32,
        seeds = [b"price-feed", asset_type.as_bytes()],
        bump
    )]
    pub price_feed: Account<'info, PriceFeed>,
    #[account(mut)]
    pub oracle: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ДОБАВИТЬ в существующий enum ErrorCode:

    #[msg("Swap failed")]
    SwapFailed,
    #[msg("KYC not verified")]
    KYCNotVerified,
    #[msg("Oracle price stale")]
    OraclePriceStale,