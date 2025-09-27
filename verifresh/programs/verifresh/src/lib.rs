use anchor_lang::prelude::*;

// We'll get a new Program ID when we deploy
declare_id!("9nk4tWoxjjMQusH2JAtfnyY56S8oUTST6nVziPVRgd32");

#[program]
pub mod verifresh_program { // Renamed to match the new project
    use super::*;

    pub fn create_product(ctx: Context<CreateProduct>, id: u64, name: String, farm_name: String) -> Result<()> {
        let product = &mut ctx.accounts.product;
        product.id = id;
        product.name = name;
        product.farm_name = farm_name;
        product.harvest_timestamp = Clock::get()?.unix_timestamp;
        product.authority = *ctx.accounts.payer.key;
        Ok(())
    }

    pub fn add_log(ctx: Context<AddLog>, status: String, location: String) -> Result<()> {
        let product = &mut ctx.accounts.product;
        require!(product.authority == *ctx.accounts.authority.key, ErrorCode::Unauthorized);

        let new_log = LogEntry {
            timestamp: Clock::get()?.unix_timestamp,
            status,
            location,
        };
        product.history.push(new_log);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateProduct<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 8 + (4 + 32) + (4 + 32) + 8 + 32 + (4 + 10 * (8 + (4+32) + (4+32))),
        seeds = [b"product", id.to_le_bytes().as_ref()],
        bump
    )]
    pub product: Account<'info, Product>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLog<'info> {
    #[account(mut, has_one = authority)]
    pub product: Account<'info, Product>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Product {
    pub id: u64,
    pub name: String,
    pub farm_name: String,
    pub harvest_timestamp: i64,
    pub authority: Pubkey,
    pub history: Vec<LogEntry>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LogEntry {
    pub timestamp: i64,
    pub status: String,
    pub location: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}