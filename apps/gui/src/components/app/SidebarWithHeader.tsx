'use client'

import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  Button,
  Portal,
} from '@chakra-ui/react'
import {
  FiHome,
  FiMenu,
} from 'react-icons/fi'
import { FaRegHandRock } from "react-icons/fa";
import { TbContract } from 'react-icons/tb';
import { PiMedalFill, PiMedalThin } from "react-icons/pi";
import { GiConfirmed } from "react-icons/gi";
import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import { config } from '../../global/config';

interface LinkItemProps {
  name: string
  icon: IconType
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: ReactNode
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Proposals', icon: FiHome },
  { name: 'New Proposal', icon: TbContract },
  { name: 'Parent Respect', icon: PiMedalFill },
  { name: 'Child Respect', icon: PiMedalThin },
  { name: 'Claim parent Respect', icon: FaRegHandRock },
  { name: 'Confirm parent Respect', icon: GiConfirmed },
]

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="0.2s ease"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderRight="1px"
      borderRightColor={{ base: 'gray.200', _dark: 'gray.700' }}
      w={{ base: 'full', lg: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {config.appTitle}
        </Text>
        <CloseButton display={{ base: 'flex', lg: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
  return (
    <Box
      as="a"
      // href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        color="black"
        fontSize="lg"
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  )
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, lg: 60 }}
      px={{ base: 4, lg: 4 }}
      height="20"
      alignItems="center"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderBottomWidth="1px"
      borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}
      justifyContent={{ base: 'space-between', lg: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
      >
        <FiMenu />
      </IconButton>

      <Text
        display={{ base: 'flex', lg: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold">
        {config.appTitle}
      </Text>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="outline" size="sm">
            0x00001
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="logout">Logout</Menu.Item>
              <Menu.Item value="copy">Copy</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>

      </Menu.Root>
    </Flex>
  )
}

const SidebarWithHeader = () => {
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={{ base: 'gray.100', _dark: 'gray.900' }}>
      <SidebarContent onClose={onClose} display={{ base: 'none', lg: 'block' }} />
      <Drawer.Root
        open={open}
        placement="start"
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer.Root>
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, lg: 60 }} p="4">
        {/* Content here */}
      </Box>
    </Box>
  )
}

export default SidebarWithHeader
