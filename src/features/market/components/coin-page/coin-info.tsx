// components/coin-info.tsx
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Globe,
  FileText,
  ExternalLink,
  ChevronDown,
  Github,
  MessageCircle,
  Twitter,
  Facebook,
  Send,
  Copy,
} from 'lucide-react'
import type { Coin } from '../../types/coin'

const InfoRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className='flex items-center justify-between py-2'>
    <span className='text-sm text-muted-foreground'>{label}</span>
    <div className='flex items-center gap-2'>{children}</div>
  </div>
)

const LinkBtn = ({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon?: typeof Globe
  children?: React.ReactNode
}) => (
  <Button
    variant='secondary'
    size='sm'
    asChild
    className='h-7 gap-1.5 text-xs max-w-50'
  >
    <Link
      to={href}
      target='_blank'
      rel='noopener noreferrer'
      className='overflow-hidden'
    >
      {Icon && <Icon className='h-3.5 w-3.5 shrink-0' />}
      <span className='truncate'>
        {children || new URL(href).hostname.replace(/^www\./, '').split('.')[0]}
      </span>
    </Link>
  </Button>
)

const LinkDropdown = ({ items }: { items: string[] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='secondary' size='sm' className='h-7 w-7 p-0'>
        <ChevronDown className='h-4 w-4' />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end' className='max-w-62.5'>
      {items.map((url, i) => (
        <DropdownMenuItem key={i} asChild>
          <Link
            to={url}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 overflow-hidden'
          >
            <ExternalLink className='h-3.5 w-3.5 shrink-0' />
            <span className='truncate'>
              {new URL(url).hostname.replace(/^www\./, '')}
            </span>
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

const CopyValue = ({ value, label }: { value: string; label: string }) => (
  <div className='flex items-center gap-2'>
    <code className='text-xs'>{label}</code>
    <Button
      variant='ghost'
      size='icon'
      className='h-6 w-6'
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <Copy className='h-3.5 w-3.5' />
    </Button>
  </div>
)

export function CoinInfo({ coin }: { coin: Coin }) {
  const website = coin.links.homepage.find(Boolean)
  const explorers = coin.links.blockchain_site.filter(Boolean)
  const github = coin.links.repos_url?.github?.[0]
  const contract = Object.values(coin.detail_platforms || {})[0]
    ?.contract_address

  const socials = [
    coin.links.twitter_screen_name && {
      url: `https://twitter.com/${coin.links.twitter_screen_name}`,
      icon: Twitter,
    },
    coin.links.facebook_username && {
      url: `https://facebook.com/${coin.links.facebook_username}`,
      icon: Facebook,
    },
    coin.links.telegram_channel_identifier && {
      url: `https://t.me/${coin.links.telegram_channel_identifier}`,
      icon: Send,
    },
    coin.links.subreddit_url && {
      url: coin.links.subreddit_url,
      icon: MessageCircle,
    },
  ].filter(Boolean) as { url: string; icon: typeof Twitter }[]

  return (
    <div className=''>
      {/* Website & Whitepaper */}
      <InfoRow label='Website'>
        {website && (
          <LinkBtn href={website} icon={Globe}>
            Website
          </LinkBtn>
        )}
        {coin.links.whitepaper && (
          <LinkBtn href={coin.links.whitepaper} icon={FileText}>
            Whitepaper
          </LinkBtn>
        )}
      </InfoRow>

      {/* Explorers */}
      {explorers.length > 0 && (
        <InfoRow label='Explorers'>
          <LinkBtn href={explorers[0]} icon={ExternalLink} />
          {explorers.length > 1 && <LinkDropdown items={explorers.slice(1)} />}
        </InfoRow>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <InfoRow label='Socials'>
          {socials.map((s, i) => (
            <Button
              key={i}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              asChild
            >
              <Link to={s.url} target='_blank' rel='noopener noreferrer'>
                <s.icon className='h-4 w-4' />
              </Link>
            </Button>
          ))}
        </InfoRow>
      )}

      {/* Forum */}
      {coin.links.official_forum_url?.[0] && (
        <InfoRow label='Community'>
          <LinkBtn href={coin.links.official_forum_url[0]} icon={MessageCircle}>
            Forum
          </LinkBtn>
        </InfoRow>
      )}

      {/* Source Code */}
      {github && (
        <InfoRow label='Source Code'>
          <LinkBtn href={github} icon={Github}>
            GitHub
          </LinkBtn>
        </InfoRow>
      )}

      {/* Contract Address */}
      {contract && (
        <InfoRow label='Contract'>
          <CopyValue
            value={contract}
            label={`${contract.slice(0, 6)}...${contract.slice(-4)}`}
          />
        </InfoRow>
      )}

      {/* Categories */}
      {coin.categories.length > 0 && (
        <InfoRow label='Categories'>
          <div className='flex items-center gap-1.5'>
            {coin.categories.slice(0, 2).map((c, i) => (
              <Badge key={i} variant='secondary' className='text-xs'>
                {c}
              </Badge>
            ))}
            {coin.categories.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge variant='secondary' className='cursor-pointer text-xs'>
                    +{coin.categories.length - 2}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {coin.categories.slice(2).map((c, i) => (
                    <DropdownMenuItem key={i} className='text-xs'>
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </InfoRow>
      )}
    </div>
  )
}
