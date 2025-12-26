<?php

namespace App\Filament\Resources;

use App\Filament\Resources\JobResource\Pages;
use App\Models\Job;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class JobResource extends Resource
{
    protected static ?string $model = Job::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Job Information')
                    ->schema([
                        Forms\Components\TextInput::make('job_number')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\Select::make('customer_id')
                            ->relationship('customer', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('customer_number')
                                    ->required()
                                    ->unique()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('contact_number')
                                    ->tel()
                                    ->required()
                                    ->maxLength(255),
                            ]),
                        Forms\Components\TextInput::make('original_case_number')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('clk_case_number')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Shipping Information')
                    ->schema([
                        Forms\Components\DatePicker::make('lk_shipped_date')
                            ->label('LK Shipped Date'),
                        Forms\Components\Select::make('shipping_method')
                            ->options([
                                'Gomaz' => 'Gomaz',
                                'Direct' => 'Direct',
                                'By hand' => 'By hand',
                            ]),
                        Forms\Components\DatePicker::make('company_received_date'),
                        Forms\Components\DatePicker::make('supplier_shipping_date'),
                    ])->columns(2),

                Forms\Components\Section::make('Warehouse Information')
                    ->schema([
                        Forms\Components\DatePicker::make('warehouse_received_date')
                            ->label('Warehouse Received Date (Singapore)'),
                        Forms\Components\TextInput::make('received_confirmation_by')
                            ->label('Received Confirmation By')
                            ->helperText('e.g., Mr. Tan or CLK Representative')
                            ->maxLength(255),
                        Forms\Components\DatePicker::make('shipped_from_singapore_date'),
                        Forms\Components\DatePicker::make('final_received_date'),
                    ])->columns(2),

                Forms\Components\Section::make('Final Confirmation')
                    ->schema([
                        Forms\Components\TextInput::make('received_by_person_name')
                            ->maxLength(255),
                        Forms\Components\Toggle::make('received_confirmation')
                            ->label('Received Confirmation'),
                    ])->columns(2),

                Forms\Components\Section::make('Items')
                    ->schema([
                        Forms\Components\Repeater::make('items')
                            ->relationship()
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('serial_number')
                                    ->maxLength(255),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add Item')
                            ->defaultItems(1),
                    ]),

                Forms\Components\Section::make('Tracking Details')
                    ->schema([
                        Forms\Components\Repeater::make('trackingDetails')
                            ->relationship()
                            ->schema([
                                Forms\Components\TextInput::make('shipping_agent_name')
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('tracking_number')
                                    ->maxLength(255),
                            ])
                            ->columns(2)
                            ->maxItems(1)
                            ->defaultItems(0),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('job_number')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.contact_number')
                    ->label('Contact')
                    ->searchable(),
                Tables\Columns\TextColumn::make('shipping_method')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Gomaz' => 'success',
                        'Direct' => 'warning',
                        'By hand' => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\IconColumn::make('received_confirmation')
                    ->boolean(),
                Tables\Columns\TextColumn::make('final_received_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('shipping_method')
                    ->options([
                        'Gomaz' => 'Gomaz',
                        'Direct' => 'Direct',
                        'By hand' => 'By hand',
                    ]),
                Tables\Filters\TernaryFilter::make('received_confirmation'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListJobs::route('/'),
            'create' => Pages\CreateJob::route('/create'),
            'edit' => Pages\EditJob::route('/{record}/edit'),
        ];
    }
}
